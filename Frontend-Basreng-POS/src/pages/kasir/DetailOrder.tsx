import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonBadge,
  IonList,
  IonCheckbox,
  IonButtons,
  IonAlert,
} from "@ionic/react";
import { cart } from "ionicons/icons";

import { useState, useEffect, useRef } from "react";
import {
  getBranch,
  TransactionPayload,
  createTransaction,
  uploadPaymentProof,
} from "../../hooks/restAPIRequest";
import { getResellers, Reseller } from "../../hooks/restAPIResellers";
import { useAuth } from "../../hooks/useAuthCookie";
import AlertInfo, { AlertState } from "../../components/AlertInfo";
import "./DetailOrder.css";
import qrcode from "../../../public/img/qr/images.png";
import Receipt, { BranchData } from "../../components/Receipt";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { selectorCartTotal } from "../../redux/cartSelectors";
import { clearCart } from "../../redux/cartSlice";

import {
  rupiahFormat,
  calculateChange,
  generateReceiptNumber,
  parseWeightGrams,
} from "../../hooks/formatting";
import React from "react";

// ALL child components imports
import CartItemList from "../../components/checkout/CartItemList";
import OrderSummary from "../../components/checkout/OrderSummary";
import ResellerSelect from "../../components/checkout/ResellerSelect";
import CustomerInfoForm from "../../components/checkout/CustomerInfoForm";
import ShopeeOrderSection from "../../components/checkout/ShopeeOrderSection";
import CashPaymentSection from "../../components/checkout/CashPaymentSection";
import PaymentMethodSection from "../../components/checkout/PaymentMethodSection";
import CheckoutButton from "../../components/checkout/CheckoutButton";
import TransactionHistoryDetail from "./TransactionHistoryDetail";

const DetailOrder: React.FC = () => {
  // untuk reset Cart
  const dispatch = useDispatch();

  // setup Alert
  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: "",
    alertMesage: "",
    hideButton: false,
  });

  const checkForm = (name: string, value: any) => {
    if (value === null || !value || value === 0 || value === "0") {
      setAlert({
        showAlert: true,
        header: "Peringatan",
        alertMesage: "Isian " + name + " tidak boleh kosong!",
      });

      alert.showAlert = false;
      return false;
    }
    return true;
  };

  const modal = useRef<HTMLIonModalElement>(null);
  const paymentModal = useRef<HTMLIonModalElement>(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isCash, setIsCash] = useState(false);
  const [isOnlineOrder, setIsOnlineOrder] = useState(false);
  const [isShopeeOrder, setIsShopeeOrder] = useState(false);

  // ============ For Payment Proof
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // =========== payment proof method
  const handleUploadPaymentProof = async (file: File) => {
    try {
      setIsUploadingProof(true);

      if (transactionCode == "") {
        console.error("Transaction code belum ada");
        return;
      }

      const result = await uploadPaymentProof(file, transactionCode);

      if (result.success) {
        setPaymentProofUrl(result.data.data.file_url);
      } else {
        console.error("Upload gagal:", result.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Form
  const [cashGiven, setCashGiven] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [shopeeCode, setShopeeCode] = useState<string | null | undefined>("");

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalBeforeDiscount: any = useSelector(selectorCartTotal);

  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [selectedResellerId, setSelectedResellerId] = useState<number | null>(
    null,
  );
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const isReseller = selectedResellerId !== null;

  const calculateResellerDiscount = (
    items: typeof cartItems,
    applyDiscount: boolean,
  ) => {
    if (!applyDiscount) {
      return { discount: 0, totalGrams: 0 };
    }

    const variantGrams: Record<string, number> = {};
    let totalGrams = 0;
    let isValidResellerWeight = true;

    items.forEach((item) => {
      const weightGrams = parseWeightGrams(item.weight_grams) ?? 500;
      if (weightGrams !== 500 && weightGrams !== 1000) {
        isValidResellerWeight = false;
      }
      const grams = item.quantity * weightGrams;
      variantGrams[item.variant_id] =
        (variantGrams[item.variant_id] ?? 0) + grams;
      totalGrams += grams;
    });

    if (!isValidResellerWeight || totalGrams < 3000 || totalGrams % 500 !== 0) {
      return { discount: 0, totalGrams };
    }

    let discount = 0;
    let mixGrams = 0;

    Object.values(variantGrams).forEach((grams) => {
      const fullKg = Math.floor(grams / 1000);
      discount += fullKg * 5000;
      mixGrams += grams % 1000;
    });

    const mixedKg = Math.floor(mixGrams / 1000);
    discount += mixedKg * 3000;

    return { discount, totalGrams };
  };

  const { discount } = calculateResellerDiscount(cartItems, isReseller);
  const total = Math.max(0, totalBeforeDiscount - discount);

  let change = calculateChange(Number(cashGiven), total);

  const { username, branchID, idUser } = useAuth();
  const [receiptNoteNumber, setReceiptNoteNumber] = useState<null | string>(
    null,
  );

  useEffect(() => {
    if (isCash) {
      setCashGiven(total);
    } else {
      setCashGiven(null);
    }
  }, [isCash, total]);

  // Menganggap cash 0 jika uang kurang dari total bayar
  useEffect(() => {
    if (cashGiven) {
      console.info("Cash:", cashGiven - total);
      if (cashGiven - total < 0) {
        setCashGiven(null);
      }
      // const change = (cashGiven - total) < 0 ? null
    }
  }, [cashGiven, total]);

  const [branchDataState, setBranchDataState] = useState<BranchData | null>(
    null,
  );

  // Load data cabang
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const data = await getBranch(Number(branchID));
        setBranchDataState(data);
        console.log(branchDataState);
      } catch (err) {
        console.error("Gagal load branch info:", err);
      }
    };

    fetchBranch();
  }, []);

  useEffect(() => {
    const fetchResellers = async () => {
      try {
        const data = await getResellers();
        setResellers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal load reseller:", err);
      }
    };

    fetchResellers();
  }, []);

  const receiptRef = useRef<HTMLDivElement>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  // const [shareFile, setShareFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertBeforeSubmit, setAlertBeforeSubmit] = useState(false);
  const [isResetButton, setIsResetButton] = useState(false);

  const handleSubmitTransaction = async () => {
    setReceiptNoteNumber(generateReceiptNumber(Number(branchID), username));

    if (!branchDataState) {
      console.warn("Branch belum dimuat.");
      setIsSubmitting(false);
      return;
    }

    if (isOnlineOrder) {
      if (!checkForm("Nama Pemesan", customerInfo.name)) return;
      if (!checkForm("Nomor HP Pemesan", customerInfo.phone)) return;
      if (!checkForm("Alamat Pemesan", customerInfo.address)) return;
    }

    const dateTimeNow = new Date();
    const formattedDateTime = dateTimeNow
      .toISOString()
      .replace("T", " ")
      .substring(0, 19); // format: yyyy-MM-dd HH:mm:ss

    const cash_amounts = isCash ? total : (cashGiven ?? 0);

    const transactionData: TransactionPayload = {
      transaction: {
        transaction_code: transactionCode,
        user_id: Number(idUser),
        date_time: formattedDateTime,
        total_price: totalBeforeDiscount,
        cash_amount: cash_amounts,
        change_amount: change,
        payment_method: paymentMethod,
        is_online_order: isOnlineOrder === true ? 1 : 0,
        customer_name: customerInfo.name === "" ? null : customerInfo.name,
        customer_address:
          customerInfo.address === "" ? null : customerInfo.address,
        customer_phone: customerInfo.phone === "" ? null : customerInfo.phone,
        notes: customerInfo.notes === "" ? null : customerInfo.notes,
        branch_id: Number(branchID),
        reseller_id: selectedResellerId,
        transaction_type: getTransactionType(),
        shopee_code: shopeeCode,
      },

      transaction_details: cartItems.map((item) => ({
        product_id: Number(item.product_id), // pastikan item.id adalah ID produk asli dari DB
        variant_id: Number(item.variant_id), // pastikan item.id adalah ID produk asli dari DB
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        weight_grams: item.weight_grams,
      })),
      is_reseller: isReseller,
      reseller_id: selectedResellerId ? Number(selectedResellerId) : null,
    };

    console.log("Data Transaksi Siap Dikirim:", transactionData);

    try {
      const result = await createTransaction(transactionData);

      if (result.success) {
        // resetForm();
        // setAlert({
        //   showAlert: true,
        //   header: "Berhasil",
        //   alertMesage: "Data Murid ditambahkan."
        // });

        // history.push('/student-list')
        console.log("Transaksi Berhasil Dicatat!", result);

        if (paymentMethod === "qris" || paymentMethod === "transfer_bank") {
          if (paymentProof && transactionCode) {
            await handleUploadPaymentProof(paymentProof);
          }
        }

        setShowSuccessAlert(true);
      } else {
        // setAlert({
        //   showAlert: true,
        //   header: "Gagal!",
        //   alertMesage: result.error
        // });
        console.log("Transaksi Gagal Dicatat: ", result);
      }
    } catch (error: any) {
      console.log("Transaksi Gagal Dicatat: ", error);
      // setAlert({
      //   showAlert: true,
      //   header: "Kasalahan Server!",
      //   alertMesage: error.error
      // });
    }
  };

  // ======================================================================= Reset Input
  const resetInput = () => {
    setShowSuccessAlert(false);

    // reset semua state setelah alert ditutup
    setPaymentMethod("cash");
    setIsCash(false);
    setCashGiven(null);
    setSelectedResellerId(null);
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      notes: "",
    });
    // setShareFile(null);
    setIsSubmitting(false);
    setShopeeCode(null);
    setIsShopeeOrder(false);
    setSelectedResellerId(null);

    dispatch(clearCart());

    // tutup modal detail order
    modal.current?.dismiss();

    // reset state bukti pembayaran
    setPaymentProof(null);
    setPaymentProofUrl(null);

    // reset transaction code state
    setTransactionCode("");
  };
  // ======================================================================= Reset Input End

  // ======================================================================= set Transaction_type
  const getTransactionType = () => {
    let transactionType = "";

    if (!isShopeeOrder) {
      transactionType = paymentMethod;
    } else {
      transactionType = "shopee";
    }
    return transactionType;
  };
  // ======================================================================= END set Transaction_type

  // === Online Order copy paste
  const copyCustomerInfoToClipboard = () => {
    const { name, phone, address, notes } = customerInfo;

    const infoText = ` Nama: ${name}\nNomor HP: ${phone}\nAlamat: ${address}\nCatatan: ${notes || "-"}`;

    navigator.clipboard
      .writeText(infoText)
      .then(() => {
        setAlert({
          showAlert: true,
          header: "Tersalin!",
          alertMesage:
            "Info Pemesan telah disalin! Silakan buka Maxim dan tempel pada Perincian pesanan.",
        });
      })
      .catch((err) => {
        console.error("Gagal menyalin:", err);
      });
    return undefined;
  };
  // === Online Order copy paste End

  useEffect(() => {
    console.log("selectedResellerId:", selectedResellerId);
  }, [selectedResellerId]);

  // ===========  for Generate transaction Code
  const [transactionCode, setTransactionCode] = useState<string>("");

  // useEffect(() => {
  //   if (modal.current) {
  //     const code = generateReceiptNumber(Number(branchID), username);
  //     setTransactionCode(code);
  //   }
  // }, [branchID, username]);

  useEffect(() => {
    return () => {
      if (paymentProof) {
        URL.revokeObjectURL(URL.createObjectURL(paymentProof));
      }
    };
  }, [paymentProof]);

  // ============== untuk open TransactionHistoryDetail
  const [openReceiptDetail, setOpenReceiptDetail] = useState(false);

  return (
    <>
      <IonFab vertical="bottom" horizontal="end" slot="fixed" color="danger">
        {cartItems.length !== 0 && (
          <IonBadge color="danger">{cartItems.length}</IonBadge>
        )}
        <IonFabButton
          id="open-detail-order"
          onClick={() => {
            if (cartItems.length === 0) return;

            const code = generateReceiptNumber(Number(branchID), username);
            setTransactionCode(code);
          }}
        >
          <IonIcon icon={cart} />
        </IonFabButton>
      </IonFab>
      <IonModal ref={modal} trigger="open-detail-order">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() => {
                  modal.current?.dismiss();
                }}
              >
                Kembali
              </IonButton>
            </IonButtons>
            <IonTitle>Detail Order</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <CartItemList items={cartItems} />
          <div className="input-method">
            <IonList>
              <OrderSummary total={totalBeforeDiscount} discount={discount} />

              <ResellerSelect
                resellers={resellers}
                value={selectedResellerId}
                onChange={setSelectedResellerId}
              />

              <IonItem>
                <IonCheckbox
                  id="online-check"
                  checked={isShopeeOrder}
                  onIonChange={(e) => {
                    setIsShopeeOrder(e.detail.checked);
                    setIsCash(e.detail.checked);
                  }}
                  disabled={isOnlineOrder}
                >
                  Pesanan Shopee?
                </IonCheckbox>
              </IonItem>
              <IonItem>
                <IonCheckbox
                  id="online-check"
                  checked={isOnlineOrder}
                  onIonChange={(e) => setIsOnlineOrder(e.detail.checked)}
                  disabled={isShopeeOrder}
                >
                  Antar Maxim?
                </IonCheckbox>
              </IonItem>
              <CustomerInfoForm
                isOnlineOrder={isOnlineOrder}
                customerInfo={customerInfo}
                setCustomerInfo={setCustomerInfo}
                copyCustomerInfoToClipboard={copyCustomerInfoToClipboard}
              />
              <ShopeeOrderSection
                isShopeeOrder={isShopeeOrder}
                shopeeCode={shopeeCode}
                setShopeeCode={setShopeeCode}
              />
              <PaymentMethodSection
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isShopeeOrder={isShopeeOrder}
                isCash={isCash}
                setIsCash={setIsCash}
              />
              {(paymentMethod === "qris" ||
                paymentMethod === "transfer_bank") && (
                <IonItem>
                  <div style={{ width: "100%" }}>
                    <p>
                      <b>Upload Bukti Pembayaran</b>
                    </p>

                    {!paymentProof && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e: any) => {
                            const file = e.target.files[0];
                            if (file) {
                              setPaymentProof(file);
                            }
                          }}
                        />
                        {isUploadingProof && <p>Uploading...</p>}
                      </>
                    )}

                    {paymentProof && (
                      <div style={{ marginTop: "10px" }}>
                        <img
                          src={URL.createObjectURL(paymentProof)}
                          alt="bukti"
                          style={{ width: "100%", borderRadius: "8px" }}
                        />
                        <p style={{ color: "green" }}>Siap diUpload ✅</p>
                      </div>
                    )}
                  </div>
                </IonItem>
              )}
              <CashPaymentSection
                isCash={isCash}
                cashGiven={cashGiven}
                setCashGiven={setCashGiven}
                change={change}
              />
            </IonList>
          </div>
          <Receipt
            ref={receiptRef}
            cash={Number(cashGiven)}
            change={change}
            total={total}
            isOnlineOrders={isOnlineOrder}
            customerInfo={customerInfo}
            cartItems={cartItems}
            receiptNoteNumber={transactionCode || "0"}
            discount={discount}
            is_reseller={isReseller}
            isShopeeOrder={isShopeeOrder}
            shopeeCode={shopeeCode}
            paymentMethod={paymentMethod}
            totalBeforeDiscount={totalBeforeDiscount}
          ></Receipt>
          <CheckoutButton
            isSubmitting={isSubmitting}
            cashGiven={cashGiven}
            onCheckout={() => setAlertBeforeSubmit(true)}
            paymentMethod={paymentMethod}
            paymentProof={paymentProof}
          />
          <div className="space"></div>
        </IonContent>
        <IonModal
          ref={paymentModal}
          trigger="open-payment-method"
          initialBreakpoint={0.75}
          breakpoints={[0.75, 1]}
        >
          <div
            className="payment-method"
            onClick={() => paymentModal.current?.setCurrentBreakpoint(1)}
          >
            {paymentMethod === "transfer_bank" && (
              <div className="transfer-bank">
                <p>Transfer ke No Rek Dibawah ini:</p>
                <h2>BRI: 1209302933012930</h2>
                <h3>NAMA: SYAKIRAH DELTA SALSABILA</h3>
                <h4>
                  <b>TOTAL BAYAR: {rupiahFormat(total)}</b>
                </h4>
              </div>
            )}

            {paymentMethod === "qris" && (
              <div className="QRIS">
                <p>Scan QR dibawah ini untuk membayar:</p>
                <h2>
                  <img src={qrcode} alt="" />
                </h2>
                <h4>
                  <b>TOTAL BAYAR: {rupiahFormat(total)}</b>
                </h4>
                <h3>BASRENG GHOSTING PLW</h3>
              </div>
            )}
          </div>
        </IonModal>
      </IonModal>
      <AlertInfo
        isOpen={alert.showAlert}
        header={alert.header}
        message={alert.alertMesage}
        onDidDismiss={() =>
          setAlert((prevState) => ({ ...prevState, showAlert: false }))
        }
        hideButton={alert.hideButton}
      />
      <IonAlert
        isOpen={showSuccessAlert}
        onDidDismiss={() => {}}
        header="Transaksi Berhasil!"
        message={"Transaksi berhasil dicatat. Cetak / Lihat struk sekarang?"}
        buttons={[
          {
            text: "Kembali",
            role: "cancel",
            handler: () => {
              resetInput();
            },
          },
          {
            text: "Cetak Struk",
            handler: () => {
              setOpenReceiptDetail(true);
            },
          },
        ]}
      />
      {showSuccessAlert && (
        <TransactionHistoryDetail
          transactionCode={transactionCode}
          isOpen={openReceiptDetail}
          onDidDismiss={() => {
            setOpenReceiptDetail(false);
            resetInput();
          }}
        />
      )}
      <IonAlert
        isOpen={alertBeforeSubmit}
        onDidDismiss={() => {}}
        header="Yakin?"
        message={
          isResetButton
            ? "Jika kembali, isi keranjang dihapus"
            : "Yakin Item Sudah Sesuai?"
        }
        buttons={[
          {
            text: "Tidak",
            role: "cancel",
            handler: () => {
              setAlertBeforeSubmit(false);
              setIsResetButton(false);
            },
          },
          {
            text: "Ya",
            handler: () => {
              if (isResetButton) {
                resetInput();
                setIsResetButton(false);
              } else {
                handleSubmitTransaction();
              }
              setAlertBeforeSubmit(false);
            },
          },
        ]}
      />
    </>
  );
};

export default DetailOrder;

import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonModal,
  IonButtons,
  IonSpinner,
} from "@ionic/react";

import { useState, useEffect, useRef } from "react";
import {
  findTransactionHistory,
  generateReceiptImage,
  getPaymentProofByTransaction,
} from "../../hooks/restAPIRequest";
import AlertInfo, { AlertState } from "../../components/AlertInfo";
import "./DetailOrder.css";
import ReceiptHistory from "../../components/ReceiptHistory";

import React from "react";
import { document } from "ionicons/icons";

interface TransactionHistoryDetailProps {
  transactionCode: string | null;
  isOpen: boolean;
  onDidDismiss: () => void | null;
}

export interface Reseller {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface TransactionDetailItem {
  transaction_id: string;
  product_name: string;
  quantity: string;
  price: string;
  subtotal: string;
  id: string;
  name: string;
  descriptions: string;
  weight_grams?: number;
  product_variant_id: string;
}

export interface Transaction {
  id: string;
  transaction_code: string;
  user_id: string;
  username: string;
  branch_id: string;
  date_time: string;
  total_price: string;
  cash_amount: string;
  change_amount: string;
  payment_method: string;
  is_online_order: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  notes: string;
  created_at: string;
  reseller_id: number | null;
  transaction_type: string | null;
  shopee_code: string | null | undefined;
  branch_name: string;
  branch_address: string;
}

export interface TransactionHistoryData {
  transactions: Transaction;
  transaction_details: TransactionDetailItem[];
  reseller?: Reseller;
}

const TransactionHistoryDetail: React.FC<TransactionHistoryDetailProps> = ({
  transactionCode,
  isOpen = undefined,
  onDidDismiss,
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [transactionData, setTransactionData] =
    useState<TransactionHistoryData | null>(null);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: "",
    alertMesage: "",
    hideButton: false,
  });

  // for payment proof view
  const [paymentProof, setPaymentProof] = useState<any | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [isLoadingProof, setIsLoadingProof] = useState(false);

  const handleLoadPaymentProof = async () => {
    if (!transactionCode) {
      return;
    }

    try {
      setIsLoadingProof(true);

      const result = await getPaymentProofByTransaction(transactionCode);

      if (result.success) {
        setPaymentProof(result.data);
        setShowProofModal(true);
      }
    } catch (err) {
      console.error("Gagal load bukti:", err);
    } finally {
      setIsLoadingProof(false);
    }
  };

  useEffect(() => {
    if (transactionCode) {
      (async () => {
        try {
          const data = await findTransactionHistory(transactionCode);
          console.info("TransactionData:", data);
          setTransactionData(data);
        } catch (error) {
          console.error("Gagal Ambil Detail Transaksi", error);
        }
      })();
    }
  }, [transactionCode]);

  const generateImageReceipt = async () => {
    setIsSharing(true);
    try {
      const payload = {
        transactions: {
          ...transactionData?.transactions,
          storeAddress: transactionData?.transactions.branch_address,
        },
        transaction_details: transactionData?.transaction_details,
        reseller: transactionData?.reseller ? transactionData?.reseller : null,
      };

      console.info(payload);
      const base64 = await generateReceiptImage(payload);

      // =========================
      // CONVERT BASE64 -> FILE
      // =========================
      const blob = await (await fetch(base64)).blob();

      const file = new File(
        [blob],
        `${transactionData?.transactions.transaction_code}.png`,
        { type: "image/jpeg" },
      );

      setShareFile(file);

      // ==================
      // SHARE DOWNLOAD PRINT
      // ==================

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Struk Pesanan",
          text: "Berikut adalah struk pesanan Anda.",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(file);
        const link = window.document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Gagal generate receipt:", err);

      setAlert({
        showAlert: true,
        header: "Error",
        alertMesage: "Gagal generate struk",
        hideButton: false,
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <IonModal ref={modal} isOpen={isOpen} onDidDismiss={onDidDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={onDidDismiss}>Kembali</IonButton>
            </IonButtons>
            <IonTitle>Riwayat Transaksi</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {transactionData && (
            <ReceiptHistory
              username={transactionData.transactions.username}
              branch_id={transactionData.transactions.branch_id}
              cash={Number(transactionData.transactions.cash_amount)}
              change={Number(transactionData.transactions.change_amount)}
              total={Number(transactionData.transactions.total_price)}
              isOnlineOrders={
                transactionData.transactions.is_online_order === "1"
              }
              customerInfo={{
                name: transactionData.transactions.customer_name,
                address: transactionData.transactions.customer_address,
                phone: transactionData.transactions.customer_phone,
                notes: transactionData.transactions.notes,
              }}
              cartItems={transactionData.transaction_details.map((item) => ({
                variant_id: String(
                  item.product_variant_id ?? item.product_variant_id,
                ), // fallback kalau belum ada
                name: item.product_name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                descriptions: item.descriptions,
                weight_grams: Number(item.weight_grams ?? 0),
                subtotal: Number(item.subtotal),
              }))}
              receiptNoteNumber={transactionData.transactions.transaction_code}
              discount={0}
              is_reseller={
                transactionData.transactions.reseller_id ? true : false
              }
              isShopeeOrder={
                transactionData.transactions.shopee_code ? true : false
              }
              shopeeCode={transactionData.transactions.shopee_code}
              paymentMethod={transactionData.transactions.payment_method}
              date={transactionData.transactions.date_time}
              branch_name={transactionData.transactions.branch_name}
              branch_address={transactionData.transactions.branch_address}
              reseller={transactionData.reseller}
            />
          )}
          {transactionData?.transactions.payment_method !== "cash" && (
            <IonButton
              expand="block"
              color="warning"
              onClick={handleLoadPaymentProof}
              disabled={isLoadingProof}
            >
              {isLoadingProof ? (
                <IonSpinner name="dots" />
              ) : (
                "Lihat Bukti Pembayaran"
              )}
            </IonButton>
          )}
          <IonButton expand="block" onClick={onDidDismiss}>
            Kembali
          </IonButton>
          <IonButton
            expand="block"
            color={"success"}
            onClick={() => generateImageReceipt()}
            disabled={isSharing}
          >
            {isSharing ? <IonSpinner name="dots" /> : `Bagikan Struk`}
          </IonButton>
          <div className="space"></div>
        </IonContent>
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
      <IonModal
        isOpen={showProofModal}
        onDidDismiss={() => {
          setShowProofModal(false);
          setPaymentProof(null);
        }}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Bukti Pembayaran</IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={() => setShowProofModal(false)}>
                Tutup
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {paymentProof ? (
            <div>
              <p>
                Metode:{" "}
                {transactionData?.transactions.payment_method.toUpperCase()}
              </p>
              <img
                src={paymentProof.file_url}
                alt="bukti"
                style={{ width: "100%", borderRadius: "10px" }}
              />
              <p style={{ fontSize: "18px", color: "gray" }}>
                {paymentProof.uploaded_at}
              </p>
            </div>
          ) : (
            <p>Tidak ada bukti pembayaran</p>
          )}
        </IonContent>
      </IonModal>
    </>
  );
};

export default TransactionHistoryDetail;

import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonItem,
  useIonViewWillEnter,
  IonImg,
} from "@ionic/react";
import { add, remove, trashBin } from "ionicons/icons";
import { rupiahFormat, formatProductName } from "../hooks/formatting";
import { getBranch } from "../hooks/restAPIRequest";
import { useAuth } from "../hooks/useAuthCookie";
import "./Receipt.css";
import { textAlign } from "html2canvas/dist/types/css/property-descriptors/text-align";
import { Reseller } from "../pages/kasir/TransactionHistoryDetail";

interface ReceiptHistoryProps {
  username: string;
  branch_id: string;
  cash: number;
  change: number;
  total: number;
  isOnlineOrders: boolean;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  cartItems: {
    variant_id: string;
    name: string;
    price: number;
    subtotal: number;
    quantity: number;
    weight_grams?: number;
    descriptions: string;
  }[];
  receiptNoteNumber: string | null;
  discount: number | string;
  is_reseller: boolean;
  isShopeeOrder: boolean;
  shopeeCode: string | null | undefined;
  paymentMethod: string | null | undefined;
  date?: string;
  branch_name: string;
  branch_address: string;
  reseller: Reseller | undefined;
}

export interface BranchData {
  branch_id: string;
  branch_name: string;
  branch_address: string;
}

const ReceiptHistory = React.forwardRef<HTMLDivElement, ReceiptHistoryProps>(
  (props, ref) => {
    const {
      username,
      cash,
      change,
      total,
      isOnlineOrders,
      customerInfo,
      cartItems,
      receiptNoteNumber,
      discount,
      is_reseller,
      isShopeeOrder,
      shopeeCode,
      paymentMethod,
      date,
      branch_name,
      branch_address,
      reseller,
    } = props;

    // const [branchData, setBranchData] = useState<BranchData | null>(null);

    // useEffect(() => {
    //   const fetchBranch = async () => {
    //     if (!props.branch_id) return;

    //     try {
    //       const res = await getBranch(Number(props.branch_id));
    //       setBranchData(res.data);
    //     } catch (err) {
    //       console.error("Gagal ambil Branch:", err);
    //     }
    //   };

    //   fetchBranch();
    // }, [props.branch_id]);

    const phone = reseller?.phone.slice(
      reseller?.phone.length - 4,
      reseller?.phone.length,
    );

    return (
      <div className="receipt-container" ref={ref}>
        <IonImg src="/logo-struk.png" className="struk-logo" alt="App Logo" />
        <table className="receipt">
          <thead>
            <tr className="receipt-title">
              <th colSpan={4}>- BASRENG GHOSTING {branch_name} -</th>
            </tr>
            <tr className="receipt-title">
              <th colSpan={4}>
                {branch_address ? `- ${branch_address} -` : "- Jalan ? -"}
              </th>
            </tr>
            <tr>
              <th colSpan={4}>
                <span></span>
              </th>
            </tr>
            <tr>
              <th className="small-text" colSpan={3}>
                NO: {receiptNoteNumber}
              </th>
              <th>Kasir: {username}</th>
            </tr>
            <tr>
              <th colSpan={4}>
                <span></span>
              </th>
            </tr>
            {reseller && (
              <tr>
                <th className="small-text" colSpan={3}>
                  Reseller: {reseller.name}
                </th>
                <th>no telp: 08XX XXXX {phone}</th>
              </tr>
            )}
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <React.Fragment key={item.variant_id}>
                <tr>
                  <td>{formatProductName(item.name, item.weight_grams)}</td>
                  <td className="small-text">{item.quantity}x</td>
                  <td>{rupiahFormat(item.price, false)}</td>
                  <td>{rupiahFormat(item.subtotal, false)}</td>
                </tr>

                {item.descriptions && (
                  <tr>
                    <td>Isi paket</td>
                    <td colSpan={3}>{item.descriptions}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            <tr>
              <td className="tr-title" colSpan={3}>
                Pembayaran
              </td>
              <td className="tr-title">{paymentMethod}</td>
            </tr>
            <tr>
              <td className="tr-title" colSpan={3}>
                Total
              </td>
              <td className="tr-title">{rupiahFormat(total, false)}</td>
            </tr>

            <tr>
              <td colSpan={3}>Tunai</td>
              <td>{rupiahFormat(cash, false)}</td>
            </tr>

            <tr>
              <td colSpan={3}>Kembalian</td>
              <td>{rupiahFormat(change, false)}</td>
            </tr>

            {isOnlineOrders && (
              <>
                <tr className="online-order-receipt tr-title ">
                  <td colSpan={3} className="tr-title">
                    Pemesan
                  </td>
                  <td>{customerInfo.name}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="tr-title">
                    No WA/HP
                  </td>
                  <td>{customerInfo.phone}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-left tr-title">
                    Alamat:
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-left">
                    {customerInfo.address}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-left tr-title">
                    Catatan Tambahan:
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-left">
                    {customerInfo.notes}
                  </td>
                </tr>
              </>
            )}
          </tbody>
          <tfoot>
            {isShopeeOrder && (
              <tr className="shopee-code">
                <td colSpan={4}>
                  <span>{shopeeCode}</span>
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={3}>
                Tgl. {date ?? new Date().toLocaleDateString("id-ID")}
              </td>
              <td>Cabang: {branch_name}</td>
            </tr>
            <tr>
              <td colSpan={4} className="info">
                <p>- Menjual Berbagai cemilan pedas -</p>
                <p>- mochi & sushi -</p>
                <p>Selamat Menikmati :) </p>
                <p>PESANAN SUDAH DISTRUK TIDAK DAPAT DIKEMBALIKAN</p>
              </td>
            </tr>
            <tr>
              <td colSpan={4}>
                <p>
                  <i>BASRENG POS v.1.1</i>
                </p>
                <p>
                  <i>App by Devon Yura Interactive Software House</i>
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  },
);
ReceiptHistory.displayName = "ReceiptHistory";
export default ReceiptHistory;

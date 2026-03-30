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
} from "@ionic/react";
import { add, remove, trashBin } from "ionicons/icons";
import { rupiahFormat, formatProductName } from "../hooks/formatting";
import { getBranch } from "../hooks/restAPIRequest";
import { useAuth } from "../hooks/useAuthCookie";
import "./Receipt.css";
import { textAlign } from "html2canvas/dist/types/css/property-descriptors/text-align";
import { CartItem } from "../../src/redux/cartSlice";
import { date } from "zod";

interface ReceiptProps {
  // branch: string[];
  // cashierName: string;
  // receiptNumber: string;
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
  cartItems: CartItem[];
  receiptNoteNumber: string | null;
  discount: number;
  is_reseller: boolean;
  isShopeeOrder: boolean;
  shopeeCode: string | null | undefined;
  paymentMethod: string | null | undefined;
  totalBeforeDiscount: number;
  date?: string;
  // branchData: BranchData | null;
}

export interface BranchData {
  branch_id: string;
  branch_name: string;
  branch_address: string;
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>((props, ref) => {
  const {
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
    totalBeforeDiscount,
    date,
  } = props;

  const { username, branchData } = useAuth();

  // const [branchDataState] = useState<BranchData | null>(branchData);

  return (
    <div className="receipt-container" ref={ref}>
      <table className="receipt">
        <thead>
          <tr className="receipt-title">
            <th colSpan={4}>- BASRENG GHOSTING {branchData?.branch_name} -</th>
          </tr>
          <tr className="receipt-title">
            <th colSpan={4}>
              {branchData?.branch_address
                ? `- ${branchData.branch_address} -`
                : "- Jalan ? -"}
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
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <React.Fragment key={item.variant_id}>
              <tr key={item.variant_id}>
                <td>{formatProductName(item.name, item.weight_grams)}</td>
                <td className="small-text">{item.quantity}x</td>
                <td>{rupiahFormat(item.price, false)}</td>
                <td>{rupiahFormat(item.price * item.quantity, false)}</td>
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
            <td className="tr-title">
              {rupiahFormat(totalBeforeDiscount, false)}
            </td>
          </tr>
          {is_reseller && (
            <tr>
              <td className="tr-title" colSpan={3}>
                Potongan Reseller
              </td>
              <td className="tr-title">-{rupiahFormat(discount, false)}</td>
            </tr>
          )}
          {is_reseller && (
            <tr>
              <td className="tr-title" colSpan={3}>
                Total (diskon)
              </td>
              <td className="tr-title">{rupiahFormat(total, false)}</td>
            </tr>
          )}
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
                  ALamat:
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
            <td>Cabang: {branchData?.branch_name}</td>
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
});
Receipt.displayName = "Receipt";
export default Receipt;

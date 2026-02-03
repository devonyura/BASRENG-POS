import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { IonGrid, IonRow, IonCol, IonButton, IonIcon, IonItem, useIonViewWillEnter } from "@ionic/react";
import { add, remove, trashBin } from "ionicons/icons";
import { rupiahFormat, } from "../hooks/formatting";
import { getBranch } from '../hooks/restAPIRequest'
import { useAuth } from "../hooks/useAuthCookie";
import "./Receipt.css"

interface ReceiptProps {
  // branch: string[];
  // cashierName: string;
  // receiptNumber: string;
  cash: number;
  change: number;
  total: number;
  isOnlineOrders: boolean;
  customerInfo: {
    name: string
    phone: string
    address: string
    notes: string
  }
  cartItems: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  receiptNoteNumber: string | null;
  // branchData: BranchData | null;
}


export interface BranchData {
  branch_id: string;
  branch_name: string;
  branch_address: string;
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>((props, ref) => {
  const { cash, change, total, isOnlineOrders, customerInfo, cartItems, receiptNoteNumber } = props;

  const { username } = useAuth();

  // const [branchDataState] = useState<BranchData | null>(branchData);

  return (
    <div className='receipt-container' ref={ref}>
      <table className="receipt">
        <thead>
          <tr className='receipt-title'>
            <th colSpan={4}>- Basreng Ghosting Palu -</th>
          </tr>
          <tr>
            <th colSpan={4}><span></span></th>
          </tr>
          <tr>
            <th className="small-text" colSpan={3}>NO: {receiptNoteNumber}</th>
            <th>
              Kasir: {username}
            </th>
          </tr>
          <tr>
            <th colSpan={4}><span></span></th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td className="small-text">{item.quantity}x</td>
              <td>{rupiahFormat(item.price, false)}</td>
              <td>{rupiahFormat((item.price * item.quantity), false)}</td>
            </tr>
          ))}
          <tr>
            <td className='tr-title' colSpan={3}>Total</td>
            <td className='tr-title'>{rupiahFormat(total, false)}</td>
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
              <tr className='online-order-receipt tr-title '>
                <td colSpan={3} className='tr-title'>Pemesan</td>
                <td>{customerInfo.name}</td>
              </tr>
              <tr>
                <td colSpan={3} className='tr-title'>No WA/HP</td>
                <td>{customerInfo.phone}</td>
              </tr>
              <tr>
                <td colSpan={4} className='text-left tr-title'>ALamat:</td>
              </tr>
              <tr>
                <td colSpan={4} className='text-left'>{customerInfo.address}</td>
              </tr>
              <tr>
                <td colSpan={4} className='text-left tr-title'>Catatan Tambahan:</td>
              </tr>
              <tr>
                <td colSpan={4} className='text-left'>{customerInfo.notes}</td>
              </tr>
            </>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Tgl. 28-10-2025</td>
            <td>Ver.1.0.0</td>
          </tr>
          <tr>
            <td colSpan={4} className='info'>
              <p>- Basreng Ghosting Palu -</p>
              <p>- Berbagai cemilan pedas, mochi & sushi -</p>
              <p>- Jalan Contoh -</p>
              <p>Selamat Menikmati :) </p>
              <p>PESANAN SUDAH DISTRUK TIDAK DAPAT DIUBAH</p>
            </td>
          </tr>
          <tr>
            <td colSpan={4}>
              <p><i>App by Devon Yura Software House</i></p>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});
Receipt.displayName = "Receipt";
export default Receipt;

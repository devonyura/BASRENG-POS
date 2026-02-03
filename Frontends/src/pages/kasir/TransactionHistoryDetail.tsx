import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonModal, IonBadge,
  IonItemDivider, IonList, IonSelect, IonSelectOption,
  IonCheckbox, IonButtons, IonAlert, IonSpinner
} from '@ionic/react';
import { cart, cellular, flashOutline, receipt } from 'ionicons/icons';

import { useState, useEffect, useRef } from 'react';
import { findTransactionHistory, getTransactionHistory } from '../../hooks/restAPIRequest';
import { useAuth } from "../../hooks/useAuthCookie";
import AlertInfo, { AlertState } from "../../components/AlertInfo";
import "./DetailOrder.css";
import { OverlayEventDetail } from '@ionic/core/components';
import Receipt, { BranchData } from "../../components/Receipt";

import React from 'react';

interface TransactionHistoryDetailProps {
  transactionCode: string | null;
  isOpen: boolean;
  onDidDismiss: () => void | null;
}

export interface TransactionDetailItem {
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: string;
  price: string;
  subtotal: string;
}

export interface Transaction {
  id: string;
  transaction_code: string;
  user_id: string;
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
}

export interface TransactionHistoryData {
  transactions: Transaction;
  transaction_details: TransactionDetailItem[];
}

// save struk
import html2canvas from 'html2canvas';

const TransactionHistoryDetail: React.FC<TransactionHistoryDetailProps> = ({
  transactionCode,
  isOpen = undefined,
  onDidDismiss
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [transactionData, setTransactionData] = useState<TransactionHistoryData | null>(null);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: '',
    alertMesage: '',
    hideButton: false,
  });

  useEffect(() => {
    if (transactionCode) {
      (async () => {
        try {
          const data = await findTransactionHistory(transactionCode)
          console.log(data);
          setTransactionData(data)
        } catch (error) {
          console.error("Gagal Ambil Detail Transaksi", error)
        }
      })();
    }

  }, [transactionCode])

  const generateImageReceipt = async () => {
    setIsSharing(true);

    try {
      if (!receiptRef.current) {
        console.error("Ref kosong");
        setIsSharing(false);
        return;
      }

      const canvas = await html2canvas(receiptRef.current);
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${transactionData?.transactions.transaction_code}.png`, {
        type: 'image/png'
      });
      setShareFile(file);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Struk Pesanan',
          text: 'Berikut adalah struk pemesanan Anda.',
          files: [file],
        });
      } else {
        // fallback download
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${transactionData?.transactions.transaction_code}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Gagal membagikan struk:", err);
    }

    setIsSharing(false);
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
            <Receipt
              ref={receiptRef}
              cash={Number(transactionData.transactions.cash_amount)}
              change={Number(transactionData.transactions.change_amount)}
              total={Number(transactionData.transactions.total_price)}
              isOnlineOrders={transactionData.transactions.is_online_order === "1"}
              customerInfo={{
                name: transactionData.transactions.customer_name,
                address: transactionData.transactions.customer_address,
                phone: transactionData.transactions.customer_phone,
                notes: transactionData.transactions.notes
              }}
              cartItems={transactionData.transaction_details.map(item => ({
                id: item.product_id, // ✅ ganti dari product_id -> id
                name: item.product_name, // ✅ ganti dari product_name -> name
                price: Number(item.price),
                quantity: Number(item.quantity),
              }))}
              receiptNoteNumber={transactionData.transactions.transaction_code}
            />
          )}

          <IonButton expand="block" onClick={onDidDismiss}>
            Kembali
          </IonButton>
          <IonButton expand="block" color={'success'} onClick={() => generateImageReceipt()} disabled={isSharing}>
            {isSharing ? <IonSpinner name='dots' /> : `Bagikan Struk`}
          </IonButton>
          <div className='space'></div>
        </IonContent>
      </IonModal>
      <AlertInfo
        isOpen={alert.showAlert}
        header={alert.header}
        message={alert.alertMesage}
        onDidDismiss={() => setAlert(prevState => ({ ...prevState, showAlert: false }))}
        hideButton={alert.hideButton}
      />
    </>
  )
};

export default TransactionHistoryDetail;

import React from "react";
import {
  IonButton,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonTextarea,
} from "@ionic/react";

interface Props {
  isOnlineOrder: boolean;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  setCustomerInfo: (nominal: any) => void;
  copyCustomerInfoToClipboard: () => undefined;
}

const CustomerInfoForm: React.FC<Props> = ({
  isOnlineOrder,
  customerInfo,
  setCustomerInfo,
  copyCustomerInfoToClipboard,
}) => {
  return (
    <IonItemGroup className={!isOnlineOrder ? "hidden-button" : ""}>
      <IonItemDivider>
        <IonLabel>Info Pemesan</IonLabel>
      </IonItemDivider>
      <IonItem>
        <IonInput
          name="customer_name"
          type="text"
          placeholder="isi Nama Pemesan"
          value={customerInfo.name}
          onIonChange={(e) =>
            setCustomerInfo({
              ...customerInfo,
              name: e.detail.value!,
            })
          }
        ></IonInput>
      </IonItem>
      <IonItem>
        <IonInput
          name="customer_phone"
          type="text"
          placeholder="Nomor WA/HP Pemesan"
          value={customerInfo.phone}
          onIonChange={(e) =>
            setCustomerInfo({
              ...customerInfo,
              phone: e.detail.value!,
            })
          }
        ></IonInput>
      </IonItem>
      <IonItem>
        <IonTextarea
          name="customer_address"
          labelPlacement="stacked"
          placeholder="Alamat Pemasan"
          value={customerInfo.address}
          onIonChange={(e) =>
            setCustomerInfo({
              ...customerInfo,
              address: e.detail.value!,
            })
          }
        ></IonTextarea>
      </IonItem>
      <IonItem>
        <IonTextarea
          name="notes"
          placeholder="Catatan: contoh: Pesanan dibayar 50K"
          autoGrow={true}
          value={customerInfo.notes}
          onIonChange={(e) =>
            setCustomerInfo({
              ...customerInfo,
              notes: e.detail.value!,
            })
          }
        ></IonTextarea>
      </IonItem>
      <IonItem className="button-wrapper">
        <IonButton
          expand="block"
          size="small"
          color={"warning"}
          onClick={copyCustomerInfoToClipboard}
        >
          Salin Info Pemesan (Untuk Order Maxim)
        </IonButton>
      </IonItem>
    </IonItemGroup>
  );
};

export default CustomerInfoForm;

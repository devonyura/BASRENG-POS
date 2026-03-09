import {
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import React from "react";

interface Props {
  isShopeeOrder: boolean;
  shopeeCode: string | null | undefined;
  setShopeeCode: (shopeeCode: string | null | undefined) => void;
}

const ShopeeOrderSection: React.FC<Props> = ({
  isShopeeOrder,
  shopeeCode,
  setShopeeCode,
}) => {
  return (
    <IonItemGroup className={!isShopeeOrder ? "hidden-button" : ""}>
      <IonItemDivider>
        <IonLabel>Nomor Pesanan Shopee</IonLabel>
      </IonItemDivider>
      <IonItem>
        <IonInput
          name="shopeeCode"
          type="text"
          placeholder="Masukkan No Pesanan, Contoh SPXID025489712345"
          value={shopeeCode}
          onIonChange={(e) => setShopeeCode(e.detail.value)}
        ></IonInput>
      </IonItem>
    </IonItemGroup>
  );
};

export default ShopeeOrderSection;

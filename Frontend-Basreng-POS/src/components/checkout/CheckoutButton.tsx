import { IonButton } from "@ionic/react";
import React from "react";

interface Props {
  isSubmitting: boolean;
  cashGiven: number | null;
  onCheckout: () => void;
  paymentMethod: string;
}

const CheckoutButton: React.FC<Props> = ({
  isSubmitting,
  cashGiven,
  onCheckout,
  paymentMethod,
}) => {
  console.log("cashGiven:", cashGiven);
  return (
    <IonButton
      expand="block"
      onClick={onCheckout}
      disabled={
        paymentMethod === "cash" && (cashGiven === 0 || cashGiven === null)
      }
    >
      Selesaikan Transaksi
    </IonButton>
  );
};

export default CheckoutButton;

import { IonButton } from "@ionic/react";
import React from "react";

interface Props {
  isSubmitting: boolean;
  cashGiven: number | null;
  onCheckout: () => void;
}

const CheckoutButton: React.FC<Props> = ({
  isSubmitting,
  cashGiven,
  onCheckout,
}) => {
  return (
    <IonButton
      expand="block"
      onClick={onCheckout}
      disabled={isSubmitting || cashGiven === null || cashGiven === 0}
    >
      Selesaikan Transaksi
    </IonButton>
  );
};

export default CheckoutButton;

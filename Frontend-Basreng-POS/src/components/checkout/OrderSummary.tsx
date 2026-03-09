import React from "react";
import { IonInput, IonItem } from "@ionic/react";
import { rupiahFormat } from "../../hooks/formatting";

interface Props {
  total: number;
  discount: number;
}

const OrderSummary: React.FC<Props> = ({ total, discount }) => {
  return (
    <>
      <IonItem>
        <IonInput
          className="input-digit"
          label="Total Belanja:"
          value={rupiahFormat(total)}
          disabled={true}
        />
      </IonItem>

      {discount > 0 && (
        <IonItem>
          <IonInput
            className="input-digit"
            label="Diskon Reseller:"
            value={`-${rupiahFormat(discount)}`}
            disabled
          />
        </IonItem>
      )}
    </>
  );
};

export default OrderSummary;

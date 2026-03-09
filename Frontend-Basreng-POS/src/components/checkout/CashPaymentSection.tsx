import { IonButton, IonInput, IonItem } from "@ionic/react";
import React from "react";
import { rupiahFormat } from "../../hooks/formatting";

interface Props {
  isCash: boolean;
  cashGiven: number | null;
  setCashGiven: (nominal: any) => void;
  change: string | number;
}

const buttonColorCash = ["success", "warning", "secondary", "danger"];

const CashPaymentSection: React.FC<Props> = ({
  isCash,
  cashGiven,
  setCashGiven,
  change,
}) => {
  return (
    <div className={`cash ${isCash ? "hidden-button" : ""}`}>
      <IonItem>
        <IonInput
          type="number"
          label="Masukkan Cash:"
          value={cashGiven ?? ""}
          onIonChange={(e) => setCashGiven(parseInt(e.detail.value!, 10))}
        ></IonInput>
      </IonItem>
      <IonItem>
        {[20000, 30000, 50000, 100000].map((nominal, key) => (
          <IonButton
            key={nominal}
            color={buttonColorCash[key]}
            size="small"
            onClick={() => setCashGiven(nominal)}
          >
            {rupiahFormat(nominal, false)}
          </IonButton>
        ))}
      </IonItem>
      <IonItem>
        <IonInput
          className="input-digit"
          label="Kembalian:"
          value={rupiahFormat(change)}
          disabled
        ></IonInput>
      </IonItem>
    </div>
  );
};

export default CashPaymentSection;

import React from "react";
import { IonItem, IonSelect, IonSelectOption } from "@ionic/react";
import { Reseller } from "../../hooks/restAPIResellers";

interface Props {
  resellers: Reseller[];
  value: number | null;
  onChange: (id: number | null) => void;
}

const ResellerSelect: React.FC<Props> = ({ resellers, value, onChange }) => {
  return (
    <IonItem>
      <IonSelect
        name="reseller"
        label="Reseller:"
        value={value}
        placeholder="Pilih Reseller"
        onIonChange={(e) => onChange(e.detail.value)}
      >
        <IonSelectOption value={null}>-- pilih reseller --</IonSelectOption>
        {resellers.map((r) => (
          <IonSelectOption key={r.id} value={r.id}>
            {r.name}
          </IonSelectOption>
        ))}
      </IonSelect>
    </IonItem>
  );
};

export default ResellerSelect;

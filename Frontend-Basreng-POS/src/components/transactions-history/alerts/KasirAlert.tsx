import { IonAlert } from "@ionic/react";
import React from "react";

interface User {
  id: string;
  username: string;
  role: string;
  branch_id: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  selectedKasirId: string | null;
  onSelect: (id: string) => void;
}

const KasirAlert: React.FC<Props> = ({
  isOpen,
  onClose,
  users,
  selectedKasirId,
  onSelect,
}) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Pilih Kasir"
      buttons={[
        { text: "Batal", role: "cancel" },
        {
          text: "Pilih",
          handler: (selectedId: string) => {
            onSelect(selectedId);
          },
        },
      ]}
      inputs={users.map((u) => ({
        label: u.username,
        type: "radio",
        value: u.id, // ✅ pakai ID
        checked: u.id === selectedKasirId, // ✅ bandingkan ID
      }))}
    />
  );
};

export default KasirAlert;

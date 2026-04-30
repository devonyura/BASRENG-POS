import { IonAlert } from "@ionic/react";

interface Branch {
  branch_id: string;
  branch_name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  selectedBranchId: string | null;
  onSelect: (id: string) => void;
}

const BranchAlert: React.FC<Props> = ({
  isOpen,
  onClose,
  branches,
  selectedBranchId,
  onSelect,
}) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Pilih Cabang"
      buttons={[
        { text: "Batal", role: "cancel" },
        {
          text: "Pilih",
          handler: (selectedId: string) => {
            onSelect(selectedId);
          },
        },
      ]}
      inputs={branches.map((b) => ({
        label: b.branch_name,
        type: "radio",
        value: b.branch_id,
        checked: b.branch_id === selectedBranchId,
      }))}
    />
  );
};

export default BranchAlert;

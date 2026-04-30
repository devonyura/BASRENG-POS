import { IonAlert } from "@ionic/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedValue: string;
  onSelect: (value: string) => void;
}

const DateFilterAlert: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedValue,
  onSelect,
}) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Filter Tanggal"
      inputs={[
        {
          label: "Hari Ini",
          type: "radio",
          value: "today",
          checked: selectedValue === "today",
        },
        {
          label: "7 Hari Terakhir",
          type: "radio",
          value: "7",
          checked: selectedValue === "7",
        },
        {
          label: "10 Hari Terakhir",
          type: "radio",
          value: "10",
          checked: selectedValue === "10",
        },
      ]}
      buttons={[
        { text: "Batal", role: "cancel" },
        {
          text: "Pilih",
          handler: (val: string) => onSelect(val),
        },
      ]}
    />
  );
};

export default DateFilterAlert;

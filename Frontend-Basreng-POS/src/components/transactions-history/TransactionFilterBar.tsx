import { IonToolbar, IonSearchbar, IonButton, IonIcon } from "@ionic/react";
import { time, location } from "ionicons/icons";

interface Props {
  selectedDateFilter: string;
  kasirUsername: string | null;
  selectedBranchName: string;
  isAdmin: boolean;
  isKasirRole: boolean;

  onOpenDate: () => void;
  onOpenKasir: () => void;
  onOpenBranch: () => void;

  getDateFilterLabel: (filter: string) => string;
}

const TransactionFilterBar: React.FC<Props> = ({
  selectedDateFilter,
  kasirUsername,
  selectedBranchName,
  isAdmin,
  isKasirRole,
  onOpenDate,
  onOpenKasir,
  onOpenBranch,
  getDateFilterLabel,
}) => {
  return (
    <>
      <IonToolbar>
        <IonSearchbar placeholder="Cari Transaksi" />
      </IonToolbar>

      <IonToolbar className="filter-container">
        {/* Date Filter */}
        <IonButton
          size="small"
          color="medium"
          disabled={!isAdmin}
          onClick={onOpenDate}
        >
          <IonIcon icon={time} size="small" />
          <span> {getDateFilterLabel(selectedDateFilter)}</span>
        </IonButton>

        {/* Kasir Filter */}
        <IonButton
          size="small"
          color="medium"
          disabled={!isAdmin && !isKasirRole}
          onClick={onOpenKasir}
        >
          Kasir : {kasirUsername}
        </IonButton>

        {/* Branch Filter */}
        <IonButton
          size="small"
          color="medium"
          disabled={!isAdmin}
          onClick={onOpenBranch}
        >
          <IonIcon icon={location} size="small" /> : {selectedBranchName}
        </IonButton>
      </IonToolbar>
    </>
  );
};

export default TransactionFilterBar;

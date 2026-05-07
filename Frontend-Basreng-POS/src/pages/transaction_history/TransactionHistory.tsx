import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonModal,
  IonAlert,
  IonButton,
  IonIcon,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";

import { useState, useRef, useEffect, useMemo } from "react";

import "./TransactionHistory.css";

import TransactionHistoryDetail from "../kasir/TransactionHistoryDetail";
import { useAuth } from "../../context/AuthContext";
import TransactionFilterBar from "../../components/transactions-history/TransactionFilterBar";
import TransactionList from "../../components/transactions-history/TransactionList";
import { useTransactionHistory } from "../../hooks/useTransactionHistory";
import KasirAlert from "../../components/transactions-history/alerts/KasirAlert";
import BranchAlert from "../../components/transactions-history/alerts/BranchAlert";
import DateFilterAlert from "../../components/transactions-history/alerts/DateFilterAlert";
import { refresh } from "ionicons/icons";
import LoadingScreen from "../../components/LoadingScreen";

export interface Branch {
  branch_id: string;
  branch_name: string;
  branch_address: string;
  created_at: string;
}

export type UserRole = "admin" | "owner" | "manager" | "kasir";

export interface User {
  id: string;
  username: string;
  branch_id: string;
  role: UserRole;
  created_at: string;
}

const TransactionHistory: React.FC = () => {
  const modalDetail = useRef<HTMLIonModalElement>(null);

  const [selectedKasirId, setSelectedKasirId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("today");
  const { idUser, role, branchID, isAuthReady } = useAuth();

  const [showKasirAlert, setShowKasirAlert] = useState(false);
  const [showBranchAlert, setShowBranchAlert] = useState(false);
  const [showDateFilterAlert, setShowDateFilterAlert] = useState(false);

  const [selectedTransactionCode, setSelectedTransactionCode] = useState<
    string | null
  >(null);

  const { transactions, branchList, usersList, isLoading, reload } =
    useTransactionHistory({
      role,
      branchID,
      selectedDateFilter,
      selectedBranchId,
      selectedKasirId,
      enabled: isAuthReady,
    });

  const selectedKasir = usersList.find((u) => u.id === selectedKasirId);

  const selectedBranch = branchList.find(
    (b) => b.branch_id === selectedBranchId,
  );

  useIonViewWillEnter(() => {
    const hasReloaded = sessionStorage.getItem("hasReloaded");

    if (!hasReloaded) {
      sessionStorage.setItem("hasReloaded", "true");
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  }, []);

  useIonViewWillLeave(() => {
    sessionStorage.removeItem("hasReloaded");
  });

  const kasirLabel = selectedKasir?.username || "Semua Kasir";
  const branchLabel = selectedBranch?.branch_name || "Semua Cabang";

  // const
  const isKasirRole = role === "kasir";
  const isAdmin = ["admin", "owner", "manager"].includes(role ?? "");

  const filteredBranches = isKasirRole
    ? branchList.filter((b) => b.branch_id === String(branchID))
    : branchList;

  useEffect(() => {
    if (!role) return;

    if (role === "kasir") {
      if (branchID && !selectedBranchId) {
        setSelectedBranchId(String(branchID));
      }

      if (idUser && !selectedKasirId) {
        setSelectedKasirId(idUser);
      }
    }
  }, [role, branchID, idUser]);

  const filteredUsers = useMemo(() => {
    return isKasirRole
      ? usersList.filter(
          (u) => u.role === "kasir" && u.branch_id === String(branchID),
        )
      : usersList.filter((u) => u.role === "kasir");
  }, [usersList, isKasirRole, branchID]);

  const getDateFilterLabel = (filter: string): string => {
    if (filter === "today") return "Hari Ini";
    if (!isNaN(Number(filter))) return `${filter} Hari Terakhir`;
    if (/^\w{3}-\d{4}$/.test(filter)) {
      const [month, year] = filter.split("-");
      return `${month.toUpperCase()} ${year}`;
    }
    return "Filter Tanggal";
  };

  // === Loading section
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <IonPage>
      {isLoading && transactions.length === 0 ? (
        <LoadingScreen />
      ) : (
        <>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Riwayat Transaksi</IonTitle>
            </IonToolbar>
            <TransactionFilterBar
              selectedDateFilter={selectedDateFilter}
              kasirUsername={kasirLabel}
              selectedBranchName={branchLabel}
              isAdmin={isAdmin}
              isKasirRole={isKasirRole}
              onOpenDate={() => setShowDateFilterAlert(true)}
              onOpenKasir={() => setShowKasirAlert(true)}
              onOpenBranch={() => setShowBranchAlert(true)}
              getDateFilterLabel={getDateFilterLabel}
            />
          </IonHeader>
          <IonContent className="ion-padding">
            <TransactionList
              data={transactions}
              onClickItem={(code) => setSelectedTransactionCode(code)}
              onReload={reload}
            />
            <IonModal
              ref={modalDetail}
              trigger="open-detail-transaction"
              initialBreakpoint={1}
              breakpoints={[0, 1]}
            >
              <h1>Detail Transaksi</h1>
            </IonModal>
          </IonContent>
          <TransactionHistoryDetail
            transactionCode={selectedTransactionCode}
            isOpen={!!selectedTransactionCode}
            onDidDismiss={() => setSelectedTransactionCode(null)}
          />

          {/* Select Username/kasir */}
          <KasirAlert
            isOpen={showKasirAlert}
            onClose={() => setShowKasirAlert(false)}
            users={filteredUsers}
            selectedKasirId={selectedKasirId}
            onSelect={(id) => {
              setSelectedKasirId(id);
            }}
          />

          {/* Select Branch/cabang */}
          <BranchAlert
            isOpen={showBranchAlert}
            onClose={() => setShowBranchAlert(false)}
            branches={filteredBranches}
            selectedBranchId={selectedBranchId}
            onSelect={(id) => {
              setSelectedBranchId(id);
            }}
          />

          {/* Select by day */}
          <DateFilterAlert
            isOpen={showDateFilterAlert}
            onClose={() => setShowDateFilterAlert(false)}
            selectedValue={selectedDateFilter}
            onSelect={(val) => setSelectedDateFilter(val)}
          />
        </>
      )}
    </IonPage>
  );
};

export default TransactionHistory;

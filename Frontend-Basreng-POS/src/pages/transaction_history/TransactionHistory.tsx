import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonLabel,
  IonSearchbar,
  IonList,
  IonItem,
  IonModal,
  useIonViewWillEnter,
  IonAlert,
} from "@ionic/react";
import { time, location } from "ionicons/icons";

import { useState, useRef, useEffect } from "react";
import { getTransactionHistory } from "../../hooks/restAPIRequest";

import { getUsers } from "../../hooks/restAPIUsers";
import { getBranches } from "../../hooks/restAPIBranch";

import { AlertState } from "../../components/AlertInfo";
import "./TransactionHistory.css";
import { rupiahFormat, shortDate } from "../../hooks/formatting";

import dayjs from "dayjs";
import TransactionHistoryDetail from "../kasir/TransactionHistoryDetail";
import { useAuth } from "../../context/AuthContext";

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
  const [kasirUsername, setKasirUsername] = useState<{
    id: string | null;
    username: string | null;
  }>({ id: "", username: "Semua Kasir" });
  const [selectedBranch, setSelectedBranch] = useState<{
    branch_id: string | null;
    branch_name: string;
  }>({ branch_id: "", branch_name: "Semua Cabang" });
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("today");
  const { idUser, role, username, branchData, branchID } = useAuth();

  const [showKasirAlert, setShowKasirAlert] = useState(false);
  const [showBranchAlert, setShowBranchAlert] = useState(false);
  const [showDateFilterAlert, setShowDateFilterAlert] = useState(false);

  const [transactionsHistory, setTransactionsHistory] = useState<any[]>([]);
  const [selectedTransactionCode, setSelectedTransactionCode] = useState<
    string | null
  >(null);

  // ============= State for keep Branch & Users data
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // ============= previlage filters sen, 23 feb 2026
  const isAdminRole = ["admin", "owner", "manager"].includes(role);
  const isKasirRole = role === "kasir";

  const filteredBranches = isKasirRole
    ? branchList.filter((b) => b.branch_id === String(branchID))
    : branchList;

  useEffect(() => {
    if (!role) return; // tunggu auth siap

    if (role === "kasir") {
      setSelectedDateFilter("today");

      setSelectedBranch({
        branch_id: branchID,
        branch_name: branchData?.branch_name || "Cabang Saya",
      });

      setKasirUsername({
        id: idUser,
        username: username,
      });
    }
  }, [role, branchID, branchData, idUser, username]);

  // const filteredUsers = isKasirRole
  //   ? usersList.filter(
  //       (k) => k.name === username, // hanya dirinya sendiri
  //     )
  //   : usersList;

  const filteredUsers = isKasirRole
    ? usersList.filter(
        (u) => u.role === "kasir" && u.branch_id === String(branchID),
      )
    : usersList.filter((u) => u.role === "kasir");
  // setup Alert
  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: "",
    alertMesage: "",
    hideButton: false,
  });

  const LoadData = async () => {
    console.log("Role:", role);
    console.log("BranchID:", branchID);
    try {
      let startDate: string | undefined;
      let endDate: string = dayjs().format("YYYY-MM-DD");

      if (!isNaN(Number(selectedDateFilter))) {
        // N hari ke belakang
        startDate = dayjs()
          .subtract(Number(selectedDateFilter), "day")
          .format("YYYY-MM-DD");
      } else if (/^\w{3}-\d{4}$/.test(selectedDateFilter)) {
        const [monthStr, yearStr] = selectedDateFilter.split("-");
        const monthIndex = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ].indexOf(monthStr.toLowerCase());
        if (monthIndex >= 0) {
          startDate = dayjs(`${yearStr}-${monthIndex + 1}-01`)
            .startOf("month")
            .format("YYYY-MM-DD");
          endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
        }
      } else if (selectedDateFilter === "today") {
        startDate = "today";
      }

      const result = await getTransactionHistory({
        username:
          kasirUsername.username === "Semua Kasir"
            ? ""
            : kasirUsername.username,
        branch: selectedBranch.branch_id
          ? parseInt(String(selectedBranch.branch_id))
          : undefined,
        start_date: startDate,
        end_date: endDate,
      });
      setTransactionsHistory(result);
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi", err);
    }
  };

  const loadMasterData = async () => {
    const branches: Branch[] = await getBranches();
    const users: User[] = await getUsers();

    setBranchList(branches);
    setUsersList(users);
  };

  useIonViewWillEnter(() => {
    LoadData();
  });

  useEffect(() => {
    if (!role) return;

    loadMasterData();
  }, [role]);

  useEffect(() => {
    if (!role) return;

    LoadData();
  }, [kasirUsername, selectedBranch, selectedDateFilter, role]);

  const getDateFilterLabel = (filter: string): string => {
    if (filter === "today") return "Hari Ini";
    if (!isNaN(Number(filter))) return `${filter} Hari Terakhir`;
    if (/^\w{3}-\d{4}$/.test(filter)) {
      const [month, year] = filter.split("-");
      return `${month.toUpperCase()} ${year}`;
    }
    return "Filter Tanggal";
  };
  if (!role) return null;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Riwayat Transaksi</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar placeholder="Cari Transaksi"></IonSearchbar>
        </IonToolbar>
        <IonToolbar className="filter-container">
          {/* Select by day */}
          <IonButton
            size="small"
            color="medium"
            disabled={!isAdminRole}
            onClick={() => setShowDateFilterAlert(true)}
          >
            <IonIcon icon={time} size="small" />
            <span> {getDateFilterLabel(selectedDateFilter)}</span>
          </IonButton>
          {/* Select Username/kasir */}
          <IonButton
            size="small"
            color="medium"
            disabled={!isAdminRole && !isKasirRole}
            onClick={() => setShowKasirAlert(true)}
          >
            Kasir : {kasirUsername.username}
          </IonButton>
          {/* Select Branch/cabang */}
          <IonButton
            size="small"
            color="medium"
            disabled={!isAdminRole}
            onClick={() => setShowBranchAlert(true)}
          >
            <IonIcon icon={location} size="small" /> :{" "}
            {selectedBranch.branch_name}
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {transactionsHistory.length > 0 ? (
            transactionsHistory.map((item, index) => (
              // <IonItemSliding key={index}>
              <IonItem
                key={index}
                onClick={() =>
                  setSelectedTransactionCode(item.transaction_code)
                }
              >
                <IonLabel color="medium">
                  <span>{shortDate(item.date)} </span>
                  Jam: <span>{item.time}</span> |{" "}
                  <span>{rupiahFormat(item.total_price)}</span>
                </IonLabel>
              </IonItem>
            ))
          ) : (
            <IonItem>
              <IonLabel>Tidak ada transaksis.</IonLabel>
            </IonItem>
          )}
        </IonList>
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
      <IonAlert
        isOpen={showKasirAlert}
        onDidDismiss={() => setShowKasirAlert(false)}
        header="Pilih Kasir"
        buttons={[
          {
            text: "Batal",
            role: "cancel",
          },
          {
            text: "Pilih",
            handler: (selectedName: string) => {
              const kasir = usersList.find((k) => k.username === selectedName);
              if (kasir) {
                setKasirUsername({
                  id: kasir.id,
                  username: kasir.username,
                });
              }
            },
          },
        ]}
        inputs={filteredUsers.map((kasir) => ({
          label: kasir.username,
          type: "radio",
          value: kasir.username,
          checked: kasir.username === kasirUsername.username,
        }))}
      />

      {/* Select Branch/cabang */}
      <IonAlert
        isOpen={showBranchAlert}
        onDidDismiss={() => setShowBranchAlert(false)}
        header="Pilih Cabang"
        buttons={[
          {
            text: "Batal",
            role: "cancel",
          },
          {
            text: "Pilih",
            handler: (selectedId: string) => {
              const cabang = branchList.find((b) => b.branch_id === selectedId);
              if (cabang) {
                setSelectedBranch(cabang);
              }
            },
          },
        ]}
        inputs={filteredBranches.map((branch) => ({
          label: branch.branch_name,
          type: "radio",
          value: branch.branch_id,
          checked: branch.branch_id === selectedBranch.branch_id,
        }))}
      />

      {/* Select by day */}
      <IonAlert
        isOpen={showDateFilterAlert}
        onDidDismiss={() => setShowDateFilterAlert(false)}
        header="Filter Tanggal"
        inputs={[
          {
            label: "Hari Ini",
            type: "radio",
            value: "today",
            checked: selectedDateFilter === "today",
          },
          {
            label: "7 Hari Terakhir",
            type: "radio",
            value: "7",
            checked: selectedDateFilter === "7",
          },
          {
            label: "10 Hari Terakhir",
            type: "radio",
            value: "10",
            checked: selectedDateFilter === "10",
          },
          {
            label: "Jan 2024",
            type: "radio",
            value: "jan-2024",
            checked: selectedDateFilter === "jan-2024",
          },
          {
            label: "Mar 2025",
            type: "radio",
            value: "mar-2025",
            checked: selectedDateFilter === "mar-2025",
          },
        ]}
        buttons={[
          {
            text: "Batal",
            role: "cancel",
          },
          {
            text: "Pilih",
            handler: (selectedValue: string) => {
              setSelectedDateFilter(selectedValue);
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default TransactionHistory;

import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonIcon,
  IonLabel,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonRow,
  IonSearchbar,
  IonList,
  IonItem,
  IonModal,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  useIonViewWillEnter,
  IonAlert,
} from "@ionic/react";
import { time, people, location } from "ionicons/icons";

import { useState, useRef, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  getTransactionHistory,
  findTransactionHistory,
} from "../../hooks/restAPIRequest";
// import { useAuth } from "../../hooks/useAuthCookie";
import AlertInfo, { AlertState } from "../../components/AlertInfo";
import "./TransactionHistory.css";
import { rupiahFormat, shortDate } from "../../hooks/formatting";
import Receipt from "../../components/Receipt";

import dayjs from "dayjs";
import TransactionHistoryDetail from "../kasir/TransactionHistoryDetail";

const TransactionHistory: React.FC = () => {
  const modalDetail = useRef<HTMLIonModalElement>(null);
  const [kasirUsername, setKasirUsername] = useState<{
    id: string | number;
    name: string;
  }>({ id: "", name: "Semua Kasir" });
  const [selectedBranch, setSelectedBranch] = useState<{
    id: string | number;
    name: string;
  }>({ id: "", name: "Semua Cabang" });
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("today");

  const [showKasirAlert, setShowKasirAlert] = useState(false);
  const [showBranchAlert, setShowBranchAlert] = useState(false);
  const [showDateFilterAlert, setShowDateFilterAlert] = useState(false);

  const [transactionsHistory, setTransactionsHistory] = useState<any[]>([]);
  const [selectedTransactionCode, setSelectedTransactionCode] = useState<
    string | null
  >(null);

  const branches = [
    { id: "", name: "Semua Cabang" },
    { id: 1, name: "Masjid Raya" },
    { id: 2, name: "Veteran" },
  ];

  const kasirs = [
    { id: "", name: "Semua Kasir" },
    { id: 1, name: "ila" },
    { id: 2, name: "admin" },
    { id: 3, name: "kasir" },
  ];

  // setup Alert
  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: "",
    alertMesage: "",
    hideButton: false,
  });

  const LoadData = async () => {
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
          kasirUsername.name === "Semua Kasir" ? "" : kasirUsername.name,
        branch: selectedBranch.id
          ? parseInt(String(selectedBranch.id))
          : undefined,
        start_date: startDate,
        end_date: endDate,
      });
      setTransactionsHistory(result);
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi", err);
    }
  };

  useIonViewWillEnter(() => {
    LoadData();
    getTransactionDetail();
  });

  const getTransactionDetail = async () => {
    const TransactionDetails = await findTransactionHistory(
      "C2-041025-102243-KASIR"
    );
    // const TransactionDetails = await findTransactionHistory('C1-070525-140316-ADMIN')
    console.log(TransactionDetails);
  };

  useEffect(() => {
    LoadData();
  }, [kasirUsername, selectedBranch, selectedDateFilter]);

  const getDateFilterLabel = (filter: string): string => {
    if (filter === "today") return "Hari Ini";
    if (!isNaN(Number(filter))) return `${filter} Hari Terakhir`;
    if (/^\w{3}-\d{4}$/.test(filter)) {
      const [month, year] = filter.split("-");
      return `${month.toUpperCase()} ${year}`;
    }
    return "Filter Tanggal";
  };

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
          <IonButton
            size="small"
            color="medium"
            onClick={() => setShowDateFilterAlert(true)}
          >
            <IonIcon icon={time} size="small" />
            <span> {getDateFilterLabel(selectedDateFilter)}</span>
          </IonButton>
          <IonButton
            size="small"
            color="medium"
            onClick={() => setShowKasirAlert(true)}
          >
            Kasir : {kasirUsername.name}
          </IonButton>
          <IonButton
            size="small"
            color="medium"
            onClick={() => setShowBranchAlert(true)}
          >
            <IonIcon icon={location} size="small" /> : {selectedBranch.name}
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
              const kasir = kasirs.find((k) => k.name === selectedName);
              if (kasir) {
                setKasirUsername(kasir);
              }
            },
          },
        ]}
        inputs={kasirs.map((kasir) => ({
          label: kasir.name,
          type: "radio",
          value: kasir.name,
          checked: kasir.name === kasirUsername.name,
        }))}
      />
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
              const cabang = branches.find((b) => b.id === selectedId);
              if (cabang) {
                setSelectedBranch(cabang);
              }
            },
          },
        ]}
        inputs={branches.map((branch) => ({
          label: branch.name,
          type: "radio",
          value: branch.id,
          checked: branch.id === selectedBranch.id,
        }))}
      />
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

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonDatetime,
  IonLoading,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonAccordion,
  IonAccordionGroup,
  IonBackButton,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { ChartRenderer } from "./ChartRenderer";
import { getAllReports, getDetailReport } from '../../hooks/restAPIReport';
import { TransactionsReport, ProductSellsReport } from '../../hooks/interfaces';
import { generatePDFReport } from "./GenerateReportPDF";
import { refresh } from 'ionicons/icons';

// Tipe data yang akan digunakan
interface DataReal {
  transactions_report?: TransactionsReport | null | undefined;
  product_sells_report: ProductSellsReport[] | null | [];
}

interface GenerateReportReturn {
  doc: jsPDF,
  dataReal: {},
  startDate: {},
  endDate: {}
}

const ReportPage: React.FC = () => {
  // ======================
  // State Management
  // ======================

  // Loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Chart state
  const [isChartWidth, setIsChartWidth] = useState(false);

  // PDF document
  const [pdfDoc, setPdfDoc] = useState<GenerateReportReturn | null>(null);

  // Data laporan
  const [transactionReport, setTransactionReport] = useState<TransactionsReport>();
  const [productSellsReport, setProductSellsReport] = useState<ProductSellsReport[] | null | undefined>();

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Filter input
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Chart reference
  const chartRef = useRef<HTMLDivElement>(null);

  // Flag apakah laporan harian
  const [isDayReport, setIsDayReport] = useState(false);

  // ======================
  // Fungsi Generate Laporan
  // ======================
  const handleGenerate = async (
    dayInput: string = '',
    monthInput: string = '',
    yearInput: string = '',
    isDayReportProp: boolean = false
  ) => {
    setIsChartWidth(false);
    setIsLoading(true);

    try {
      let dataChart;
      if (isDayReportProp) {
        setIsDayReport(true);
        dataChart = await getDetailReport(dayInput);
      } else {
        dataChart = await getAllReports(dayInput, monthInput, yearInput);
      }

      // Cek apakah data kosong
      const isEmptyData =
        (dataChart.transactions_report?.length ?? 0) === 0 &&
        (dataChart.product_sells_report?.length ?? 0) === 0 &&
        (dataChart.branch_report?.length ?? 0) === 0;

      if (isEmptyData) {
        setAlertMessage(`Laporan pada ${dayInput || '...'}-${monthInput || '...'}-${yearInput || '...'} tidak ada.`);
        setShowAlert(true);
        setIsLoading(false);
        return;
      }

      // Jika data ada, set data dan generate PDF
      setTransactionReport(dataChart.transactions_report);
      setProductSellsReport(dataChart.product_sells_report);

      const data = await generatePDFReport(dayInput, monthInput, yearInput, chartRef, isDayReportProp);
      setPdfDoc(data);

      setIsChartWidth(true);
      setShowDownloadAlert(true);
      setAlertMessage(`Silakan unduh laporan dengan klik tombol di bawah.`);
    } catch (error) {
      console.error("Gagal generate PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // Fungsi Download PDF
  // ======================
  const downloadPDF = () => {
    if (pdfDoc) {

      pdfDoc.doc.save(`laporan_basreng_pos ${pdfDoc.startDate} - ${pdfDoc.endDate}.pdf`);
      // refreshPage()
    }
  };

  // ======================
  // Fungsi Reload Page
  // ======================
  const refreshPage = () => {
    // navigate(0); // reloads the page
    // atau
    // navigate(location.pathname); // navigasi ke route yang sama
    window.location.reload();
  };

  // ======================
  // Handler Filter
  // ======================
  const handleGenerateLast30Days = () => handleGenerate('30');
  const handleGenerateLast7Days = () => handleGenerate('7');
  const handleGenerateMonthly = () => handleGenerate('', selectedMonth, selectedYear);
  const handleGenerateDaily = () => handleGenerate(selectedDate, '', '', true);

  // ======================
  // Render
  // ======================
  return (
    <IonPage>
      {/* HEADER */}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Halaman Laporan</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={refreshPage}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Accordion untuk pilihan laporan */}
        <IonAccordionGroup expand="compact">
          {/* Laporan Harian */}
          <IonAccordion value="daily">
            <IonItem slot="header" lines="full">
              <IonLabel>
                <h2>Laporan Harian</h2>
              </IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              <IonItem>
                <IonDatetime
                  presentation="date"
                  onIonChange={(e) => {
                    const value = e.detail.value!;
                    if (value && typeof value === "string") {
                      const selectedDateOnly = value.split("T")[0];
                      setSelectedDate(selectedDateOnly);
                    }
                  }}
                />
              </IonItem>
              <IonItem>
                <IonButton
                  expand="block"
                  disabled={!selectedDate}
                  onClick={handleGenerateDaily}
                >
                  Buat Laporan Hari {selectedDate}
                </IonButton>
              </IonItem>
            </div>
          </IonAccordion>

          {/* Laporan X Hari Terakhir */}
          <IonAccordion value="last-days">
            <IonItem slot="header" lines="full">
              <IonLabel>
                <h2>Laporan -H</h2>
              </IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              <IonItem>
                <IonButton expand="block" onClick={handleGenerateLast30Days}>
                  Buat Laporan 30 Hari Terakhir
                </IonButton>
              </IonItem>
              <IonItem>
                <IonButton expand="block" onClick={handleGenerateLast7Days}>
                  Buat Laporan 7 Hari Terakhir
                </IonButton>
              </IonItem>
            </div>
          </IonAccordion>

          {/* Laporan Bulanan */}
          <IonAccordion value="monthly">
            <IonItem slot="header" lines="full">
              <IonLabel>
                <h2>Laporan Bulanan</h2>
              </IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              <IonItem>
                <IonDatetime
                  presentation="month"
                  onIonChange={(e) => {
                    const value = e.detail.value;
                    if (value && typeof value === "string") {
                      const [year, month] = value.split("-");
                      setSelectedYear(year);
                      setSelectedMonth(month);
                    }
                  }}
                />
              </IonItem>
              <IonItem>
                <IonLabel>Tahun</IonLabel>
                <IonSelect
                  value={selectedYear}
                  placeholder="Pilih Tahun"
                  onIonChange={(e) => setSelectedYear(e.detail.value)}
                >
                  {Array.from({ length: 5 }, (_, idx) => {
                    const year = new Date().getFullYear() - idx;
                    return (
                      <IonSelectOption key={year} value={year.toString()}>
                        {year}
                      </IonSelectOption>
                    );
                  })}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonButton
                  expand="block"
                  disabled={!selectedMonth || !selectedYear}
                  onClick={handleGenerateMonthly}
                >
                  Buat Laporan Bulan {selectedMonth} Tahun {selectedYear}
                </IonButton>
              </IonItem>
            </div>
          </IonAccordion>
        </IonAccordionGroup>

        {/* Chart Preview */}
        <ChartRenderer
          ref={chartRef}
          transactionsReport={transactionReport}
          productSellsReport={productSellsReport}
          setWidth={isChartWidth}
          isDayReport={isDayReport}
        />

        {/* Loading Indicator */}
        <IonLoading
          isOpen={isLoading}
          message={'Tunggu sebentar, laporan sedang dibuat...'}
          spinner="dots"
        />

        {/* Alert jika data kosong */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Informasi"
          message={alertMessage}
          buttons={['OK']}
        />

        {/* Alert untuk download */}
        <IonAlert
          isOpen={showDownloadAlert}
          onDidDismiss={() => setShowDownloadAlert(false)}
          header="Laporan Selesai Dibuat!"
          message={alertMessage}
          buttons={[
            {
              text: 'Kembali',
              role: 'cancel',
              handler: () => setShowDownloadAlert(false)
            },
            {
              text: 'Download',
              handler: downloadPDF
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ReportPage;

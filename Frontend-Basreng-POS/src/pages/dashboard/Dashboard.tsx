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
  IonCol, IonGrid, IonRow,
  IonSearchbar,
  IonList, IonItem,
  IonModal,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonButtons,
  IonMenuButton,
  IonMenu,
  IonAlert,
  IonMenuToggle,
  IonText,
  IonChip, IonSpinner, IonToast
} from '@ionic/react';
import { exitOutline, statsChart, pricetagsOutline, build, people, cashOutline, cubeOutline, personCircleOutline, refresh } from 'ionicons/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Pie,
  PieChart,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';


import { useState, useRef, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { loginRequest } from '../../hooks/restAPIRequest';
import { useAuth } from "../../hooks/useAuthCookie";
import AlertInfo, { AlertState } from "../../components/AlertInfo";
import "./Dashboard.css";
import { getTransactionSummary, getIncomeByBranch, getTopSellingProduct, getTransactionsReport, BranchIncome } from "../../hooks/restAPIDashboard";
import { rupiahFormat } from '../../hooks/formatting';

interface LocationState {
  isTokenExpired?: boolean;
  dontRefresh?: boolean;
}

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [incomeByBranch, setIncomeByBranch] = useState<BranchIncome[]>([]);
  const [topSellingProduct, setTopSellingProduct] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [errorChart, setErrorChart] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setLoadingChart(true);
    try {
      try {
        const summaryData = await getTransactionSummary();
        setSummary(summaryData);
      } catch (e) {
        console.warn('Gagal ambil ringkasan transaksi:', e);
      }

      try {
        const incomeData = await getIncomeByBranch();
        setIncomeByBranch(incomeData);
      } catch (e) {
        console.warn('Gagal ambil pendapatan cabang:', e);
      }

      try {
        const topSellingData = await getTopSellingProduct();
        const pieData = topSellingData.map((item: any) => ({
          ...item,
          total_sold: parseInt(item.total_sold, 10),
        }));
        setTopSellingProduct(pieData);
      } catch (e) {
        console.warn('Gagal ambil produk terlaris:', e);
      }

      try {
        const response = await getTransactionsReport(30);
        // Pastikan total_sales dikonversi ke number
        console.log('Chart API response:', response); // 👉 cek isi response
        // Asumsikan response adalah array langsung, kalau tidak kita perbaiki
        const formatted = response.map((item: any) => ({
          date: item.date,
          total_sales: parseFloat(item.total_sales),
        }));
        setChartData(formatted);
        console.log(chartData);
        setLoadingChart(false);
      } catch (error: any) {
        setErrorChart(error.message || 'Gagal memuat chart');
        setLoadingChart(false);
      }

    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat sebagian data dashboard.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {

    fetchData();
  }, []);

  // setup Alert
  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: '',
    alertMesage: '',
    hideButton: false,
  });

  const { login, logout, token, role } = useAuth();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [isTokenExpired, setIsTokenExpired] = useState(location.state?.isTokenExpired || false);
  const [showLogoutAlert, setLogoutShowAlert] = useState(false);



  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

  const handleLogout = () => {
    logout();
  }

  return (
    <>
      <IonMenu contentId="main-content" >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Admin Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonMenuToggle>
            <IonButton routerLink="/product-list" expand="block">
              <IonIcon icon={pricetagsOutline} slot="start" />
              Data Barang
            </IonButton>
          </IonMenuToggle>
          <IonMenuToggle>
            <IonButton routerLink="/categories" expand="block">
              <IonIcon icon={pricetagsOutline} slot="start" />
              Kategori
            </IonButton>
          </IonMenuToggle>
          <IonMenuToggle>
            <IonButton routerLink="/branch" expand="block">
              <IonIcon icon={build} slot="start" />
              Cabang
            </IonButton>
          </IonMenuToggle>
          <IonMenuToggle>
            <IonButton routerLink="/users" expand="block">
              <IonIcon icon={people} slot="start" />
              Management Akun
            </IonButton>
          </IonMenuToggle>
          <IonMenuToggle>
            <IonButton routerLink="/report" expand="block">
              <IonIcon icon={people} slot="start" />
              Laporan
            </IonButton>
          </IonMenuToggle>
          <IonButton onClick={() => setLogoutShowAlert(true)} expand='block'>
            <IonIcon icon={exitOutline} slot='start' />
            Keluar
          </IonButton>
        </IonContent>
      </IonMenu>
      <IonPage id='main-content'>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot='start'>
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>📊 Ringkasan Hari ini</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={fetchData}>
                <IonIcon icon={refresh} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Ringkasan Hari ini</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonGrid>

            {/* Ringkasan Penjualan */}
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonGrid>
                    <IonRow>
                      <IonCol className='icon-card'>
                        <IonIcon icon={statsChart}></IonIcon>
                      </IonCol>
                      <IonCol size="8">
                        <IonCardHeader>
                          <IonCardTitle>Transaksi Hari Ini:</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <div className='details-card'>
                            <h5>Cabang: Semua cabang</h5>
                            <h2>{rupiahFormat(summary?.hari_ini || 0)}</h2>
                            <h4>Dari <strong>{summary?.jumlah_transaksi_hari_ini || 0}</strong> Transaksi</h4>
                          </div>
                        </IonCardContent>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCard>
                {/* Pendapatan per Cabang */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>🏪 Pendapatan per Cabang</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>{loading ? (
                    <IonSpinner name="lines-small" />
                  ) : (
                    <IonList>
                      {incomeByBranch.map((branch, idx) => (
                        <IonItem key={idx}>
                          <IonLabel>
                            {branch.branch_name}:<br></br>
                            <strong>{rupiahFormat(branch.total_income)}</strong> dari < strong > {branch.total_transactions}</strong> transaksi
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  )}
                  </IonCardContent>
                </IonCard>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>🧾 Ringkasan Omset</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loading ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <IonGrid>
                        <IonRow>
                          <IonCol size="12">
                            <IonChip color="medium">
                              <IonIcon icon={cashOutline} />
                              <IonLabel>Minggu Ini: {rupiahFormat(summary?.minggu_ini || 0)}</IonLabel>
                            </IonChip>
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol size="12">
                            <IonChip color="tertiary">
                              <IonIcon icon={cashOutline} />
                              <IonLabel>Bulan Ini: {rupiahFormat(summary?.bulan_ini || 0)}</IonLabel>
                            </IonChip>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
            <IonRow>
              {/* Produk Terlaris */}
              <IonCol size="12" sizeMd="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>🔥5 Produk Terlaris Hari ini</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loading ? (
                      <IonSpinner name="lines-small" />
                    ) : topSellingProduct.length > 0 ? (
                      <div style={{ width: "100%", height: 250 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={topSellingProduct}
                              dataKey="total_sold"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              label
                            >
                              {topSellingProduct.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <IonText>Belum ada data produk terlaris.</IonText>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            {/* Visualisasi */}
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>📈 Omset 7 hari terakhir </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loadingChart && <p>Memuat data chart...</p>}
                    {errorChart && <p style={{ color: 'red' }}>{errorChart}</p>}

                    {!loadingChart && !errorChart && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                          <XAxis dataKey="date" angle={-50} textAnchor="end" />
                          <YAxis tickFormatter={(value) => `${value / 1_000_000}jt`} />
                          <Tooltip formatter={(value: number) => `Rp.${value.toLocaleString()}`} />
                          <Bar type="monotone" dataKey="total_sales" stroke="#3880ff" strokeWidth={2} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

          </IonGrid >
          {/* Error Message */}
          < IonToast
            isOpen={!!error
            }
            message={error!}
            duration={3000}
            color="danger"
            onDidDismiss={() => setError(null)}
          />
        </IonContent >

        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setLogoutShowAlert(false)}
          header="Konfirmasi"
          message="Yakin ingin Logout akun?"
          buttons={[
            {
              text: "Batal",
              role: "cancel",
            },
            {
              text: "Keluar",
              handler: handleLogout,
            },
          ]}
        />

        <AlertInfo
          isOpen={alert.showAlert}
          header={alert.header}
          message={alert.alertMesage}
          onDidDismiss={() => setAlert(prevState => ({ ...prevState, showAlert: false }))}
          hideButton={alert.hideButton}
        />
      </IonPage >
    </>
  )
};

export default Dashboard;

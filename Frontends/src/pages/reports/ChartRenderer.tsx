// components/ChartRenderer.tsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import "./ChartRenderer.css";
import { TransactionsReport, ProductSellsReport } from '../../hooks/interfaces';
import { rupiahFormat } from "../../hooks/formatting";

// Warna untuk chart (Bar dan Pie)
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A28CFF", "#FF6B6B", "#4D96FF", "#00B8A9",
  "#FF8C42", "#5E60CE", "#6930C3", "#7400B8",
  "#3F37C9",
];

interface ChartRendererProps {
  transactionsReport?: TransactionsReport | null | undefined;
  productSellsReport?: ProductSellsReport[] | null;
  setWidth: boolean;
  isDayReport: boolean;
}

// Komponen utama ChartRenderer
export const ChartRenderer = React.forwardRef<HTMLDivElement, ChartRendererProps>(
  ({ transactionsReport, productSellsReport, setWidth, isDayReport }, ref) => {

    // Jika sedang menggunakan laporan harian, komponen tidak menampilkan grafik
    if (isDayReport) {
      return null;
    }

    // Jika laporan transaksi tidak tersedia atau kosong
    if (!transactionsReport || Object.keys(transactionsReport).length === 0) {
      return <div>Laporan Belum dibuat.</div>;
    }

    // Mengambil daftar nama cabang dari laporan transaksi
    const branchNames: string[] = Object.keys(transactionsReport);

    /**
     * Persiapan data untuk BarChart
     * - Looping berdasarkan indeks data pada cabang pertama
     * - Ambil tanggal dari data cabang pertama
     * - Format tanggal agar hanya menampilkan hari dan tanggal (tanpa tahun)
     * - Bangun baris data dengan key sesuai nama cabang
     */
    const barChartData = branchNames.length > 0
      ? transactionsReport[branchNames[0]].map((_, idx) => {
        const rawDate = transactionsReport[branchNames[0]][idx].date;
        const [dayPart, datePart] = rawDate.split(', ');
        const dateWithoutYear = datePart.split(' ').slice(0, 2).join(' ');
        const date = `${dayPart}, ${dateWithoutYear}`;

        const row: Record<string, number | string> = { date };
        branchNames.forEach(branch => {
          const sales = Number(transactionsReport[branch][idx]?.total_sales || 0);
          row[branch] = sales;
        });
        return row;
      })
      : [];

    // Data untuk PieChart (6 produk terlaris)
    const pieChartData = productSellsReport
      ? productSellsReport.slice(0, 6).map(product => ({
        name: product.product_name,
        value: Number(product.total_sold)
      }))
      : [];

    // Tanggal awal dan akhir laporan (dari cabang pertama)
    const branch = branchNames[0];
    const transactions = transactionsReport[branch];
    const startDate = transactions?.[0]?.date || "";
    let endDate = transactions?.[transactions.length - 1]?.date || "";
    endDate = (endDate === startDate ? '' : endDate);

    return (
      <div ref={ref} className="chart-container" style={setWidth ? { width: '100%' } : {}}>
        {/* Judul utama chart */}
        <h2 className="chart-header">
          📊 Grafik Laporan {endDate !== '' ? 'dari' : ''} {startDate} {endDate !== '' && `- ${endDate}`}
        </h2>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={barChartData}
            margin={{ top: 20, right: 30, left: 50, bottom: 60 }}
          >
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <XAxis dataKey="date" angle={-50} textAnchor="end" />
            <YAxis tickFormatter={(value) => rupiahFormat(value)} />
            <Tooltip />
            {branchNames.map((branch, index) => (
              <Bar
                key={branch}
                dataKey={branch}
                fill={COLORS[index % COLORS.length]}
                name={branch}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Subjudul Pie Chart */}
        <h3 className="chart-subheader">
          6 Produk Terlaris {endDate !== '' ? 'dari' : ''} {startDate} {endDate !== '' && `- ${endDate}`}
        </h3>

        {/* Pie Chart */}
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ paddingBottom: '130px' }}
              />
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

ChartRenderer.displayName = "ChartRenderer";

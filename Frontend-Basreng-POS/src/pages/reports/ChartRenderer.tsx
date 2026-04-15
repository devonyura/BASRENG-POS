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
  Legend,
} from "recharts";
import "./ChartRenderer.css";
import { rupiahFormat, rupiahFormatBarChart } from "../../hooks/formatting";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CFF",
  "#FF6B6B",
  "#4D96FF",
  "#00B8A9",
  "#FF8C42",
  "#5E60CE",
  "#6930C3",
  "#7400B8",
  "#3F37C9",
];

interface ChartRendererProps {
  chartData?: {
    labels: string[];
    datasets: Record<string, any>;
  };
  summary?: any;
  branches?: any[];
  setWidth: boolean;
  isDayReport: boolean;
}

export const ChartRenderer = React.forwardRef<
  HTMLDivElement,
  ChartRendererProps
>(({ chartData, summary, branches, setWidth, isDayReport }, ref) => {
  if (!chartData) {
    return <div>Laporan belum dibuat.</div>;
  }

  const { labels, datasets } = chartData;

  // ======================
  // NORMALIZE BAR CHART
  // ======================
  const branchNames = Object.keys(datasets);

  const barChartData = labels.map((label, idx) => {
    const row: Record<string, any> = { label };

    branchNames.forEach((branch) => {
      const data = datasets[branch];

      if (Array.isArray(data)) {
        // daily (array)
        row[branch] = Number(data[idx] || 0);
      } else {
        // range / monthly (object)
        row[branch] = Number(data[label] || 0);
      }
    });

    return row;
  });

  // ======================
  // PIE CHART (payment summary)
  // ======================
  const pieChartData = summary
    ? Object.entries(summary.payment_summary).map(([key, value]) => ({
        name: key.toUpperCase(),
        value: Number(value),
      }))
    : [];

  return (
    <div
      ref={ref}
      className="chart-container"
      style={setWidth ? { width: "100%" } : {}}
    >
      {/* HEADER */}
      <h2 className="chart-header">
        📊 Grafik Laporan ({labels[0]}{" "}
        {labels.length > 1 && `- ${labels[labels.length - 1]}`})
      </h2>

      {/* BAR CHART */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={barChartData}
          margin={{ top: 20, right: 30, left: 50, bottom: 60 }}
        >
          <Legend verticalAlign="top" align="center" />
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            tickFormatter={(value) => value.slice(5)} // contoh: 2026-04-16 → 04-16
          />
          <YAxis
            domain={[0, "dataMax"]}
            allowDecimals={false}
            tickFormatter={(v) => rupiahFormatBarChart(Number(v))}
          />
          <Tooltip
            formatter={(value: any) => rupiahFormatBarChart(Number(value))}
          />

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

      {/* PIE CHART */}
      <h3 className="chart-subheader">Komposisi Metode Pembayaran</h3>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Tooltip formatter={(value: any) => rupiahFormat(Number(value))} />
            <Legend verticalAlign="top" align="center" />
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) =>
                `${name}: ${rupiahFormat(Number(value))}`
              }
            >
              {pieChartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";

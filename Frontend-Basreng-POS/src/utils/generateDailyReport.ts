import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { rupiahFormat, shortDate } from "../hooks/formatting";

interface Summary {
  hari_ini: number;
  jumlah_transaksi_hari_ini: number;
}

interface Product {
  product_name: string;
  total_sold: number;
  total_sales: number;
}

interface BranchIncome {
  branch_id: string;
  branch_name: string;
  total_transactions: string;
  total_income: string;
}

export const generateDailyReport = ({
  summary,
  branches,
  products,
  date,
}: {
  summary: Summary;
  branches: BranchIncome[];
  products: Product[];
  date: string;
}) => {
  const doc = new jsPDF();

  // ================= HEADER =================
  doc.setFontSize(14);
  doc.text("BASRENG GHOSTING", 14, 15);

  doc.setFontSize(11);
  doc.text("Laporan Harian", 14, 22);
  doc.text(`Tanggal: ${shortDate(date)}`, 14, 28);
  doc.text(`Dicetak: ${new Date().toLocaleString()}`, 14, 34);

  // ================= SUMMARY =================
  let y = 45;

  doc.setFontSize(12);
  doc.text("Ringkasan", 14, y);

  y += 6;

  doc.setFontSize(10);

  doc.text(`Total Omset        : ${rupiahFormat(summary.hari_ini)}`, 14, y);
  y += 5;
  doc.text(
    `Total Transaksi    : ${summary.jumlah_transaksi_hari_ini}`,
    14,
    y
  );
  y += 5;

  // ================= TABLE CABANG =================
  y += 10;

  doc.setFontSize(12);
  doc.text("Pendapatan per Cabang", 14, y);

  autoTable(doc, {
    startY: y + 3,
    head: [["Cabang", "Total Transaksi", "Omset"]],
    body: branches.map((b) => [
      b.branch_name,
      b.total_transactions,
      rupiahFormat(b.total_income),
    ]),
  });

  // ================= TABLE PRODUK =================
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("Produk Terlaris", 14, finalY);

  console.log("RAW TOP SELLING:", products);
  autoTable(doc, {
    startY: finalY + 3,
    head: [["Produk", "Qty Terjual", "Omset"]],
    body: products.map((p) => [
      p.product_name || "-",
      p.total_sold,
      rupiahFormat(p.total_sales),
    ]),
  });

  // ================= SAVE =================
  doc.save(`Laporan-Harian-${date}.pdf`);
};
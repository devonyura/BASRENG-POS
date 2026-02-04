import { toBlob } from "html-to-image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { rupiahFormat } from "../../hooks/formatting";
import { AllReportsResponse, BranchReport, AllDetailReportsResponse } from "../../hooks/interfaces";
import { getAllReports, getDetailReport } from "../../hooks/restAPIReport";

/**
 * Fungsi generatePDFReport untuk membuat laporan dalam bentuk PDF.
 * @param day Filter hari (opsional).
 * @param month Filter bulan (opsional).
 * @param year Filter tahun (opsional).
 * @param chartRefs Referensi chart yang akan dimasukkan ke PDF (opsional).
 * @param isDayReport Flag untuk menentukan apakah laporan detail harian atau bulanan/tahunan.
 */
export const generatePDFReport = async (
  day: string = '',
  month: string = '',
  year: string = '',
  chartRefs?: React.RefObject<HTMLDivElement>,
  isDayReport: boolean = false
) => {
  // Inisialisasi dokumen PDF
  const doc = new jsPDF();

  // Fetch data sesuai jenis laporan
  let dataReal;
  if (isDayReport) {
    dataReal = await getDetailReport(day) as AllDetailReportsResponse;
  } else {
    dataReal = await getAllReports(day, month, year) as AllReportsResponse;
  }

  // ========== Generate Rentang Tanggal ==========
  const allDates: { raw: string; dateObj: Date }[] = [];
  Object.keys(dataReal.transactions_report).forEach((location) => {
    dataReal.transactions_report[location].forEach((item) => {
      const rawDate = item.date;
      const parts = rawDate.split(", ")[1];
      const dateObj = new Date(parts);
      allDates.push({ raw: rawDate, dateObj });
    });
  });
  allDates.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  const startDate = allDates[0]?.raw || "-";
  const endDate = allDates[allDates.length - 1]?.raw || "-";

  // ========== HEADER UTAMA ==========
  doc.setFontSize(14);
  doc.text("Basreng POS Report", doc.internal.pageSize.getWidth() / 2, 12, {
    align: "center"
  });

  // ========== TABEL TRANSAKSI PER LOKASI ==========
  const locations = Object.keys(dataReal.transactions_report);
  locations.forEach((location, index) => {
    if (index > 0) doc.addPage();

    doc.setFontSize(12);
    doc.text(
      `Laporan Cabang ${location}: Tanggal ${startDate} ${startDate === endDate ? '' : `sampai ${endDate}`}`,
      doc.internal.pageSize.getWidth() / 2,
      19,
      { align: "center" }
    );

    // TABEL DETAIL TRANSAKSI HARIAN
    if (isDayReport) {
      const detailData = dataReal as AllDetailReportsResponse;
      const tableData = detailData.transactions_report[location].map((item, index) => {
        // Parsing jam dari kode transaksi (format: BR-LOC-083247-...)
        const parts = item.transaction_code.split("-");
        let formattedTime = '';
        if (parts.length >= 3 && parts[2].length >= 4) {
          const timePart = parts[2];
          const hour = timePart.substring(0, 2);
          const minute = timePart.substring(2, 4);
          formattedTime = `${hour}:${minute}`;
        }

        return [
          index + 1,
          formattedTime,
          item.transaction_code,
          item.total_item,
          item.payment_method,
          (item.is_online_order === '0') ? 'Tidak' : 'Ya',
          rupiahFormat(item.total_price)
        ];
      });

      autoTable(doc, {
        startY: 23,
        head: [["No", "Jam", "Kode Transaksi", "Total Item", "Metode Pembayaran", "Order Online", "Total Harga"]],
        body: tableData,
        headStyles: {
          fillColor: [189, 111, 10],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
    }
    // TABEL REKAP BULANAN/TAHUNAN
    else {
      const tableData = dataReal.transactions_report[location].map((item, index) => [
        index + 1,
        item.date,
        item.total_transactions,
        rupiahFormat(item.total_sales)
      ]);

      autoTable(doc, {
        startY: 23,
        head: [["No", "Tanggal", "Total Penjualan", "Total Transaksi"]],
        body: tableData,
        headStyles: {
          fillColor: [189, 111, 10],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
    }

    // Footer copyright setiap halaman lokasi
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "copyright@2025 Devon Yura App | Basreng POS",
      doc.internal.pageSize.getWidth() / 2,
      pageHeight - 10,
      { align: "center" }
    );
  });

  // ========== TABEL TOTAL PENJUALAN PER CABANG ==========
  doc.addPage();
  doc.setFontSize(14);
  doc.text(
    `Laporan Total Penjualan Per Cabang dari ${startDate} ${startDate === endDate ? '' : `sampai ${endDate}`}`,
    14,
    20
  );

  const branchTableData = dataReal.branch_report.map((branch: BranchReport) => [
    branch.branch_name,
    branch.total_transactions,
    rupiahFormat(branch.total_sales)
  ]);

  autoTable(doc, {
    startY: 25,
    head: [["Cabang", "Total Transaksi", "Total Penjualan"]],
    body: branchTableData,
    headStyles: {
      fillColor: [189, 9, 9],
      textColor: 255,
      fontStyle: 'bold'
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "copyright@2025 Devon Yura App | Basreng POS",
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // ========== TABEL SALES SEMUA PRODUK ==========
  doc.addPage();
  doc.setFontSize(14);
  doc.text(
    `Laporan Sales Semua Produk dari ${startDate} ${startDate === endDate ? '' : `sampai ${endDate}`}`,
    14,
    20
  );

  const productTableData = dataReal.product_sells_report.map((product, index) => [
    index + 1,
    product.product_name,
    product.total_sold,
    rupiahFormat(product.total_sales)
  ]);

  autoTable(doc, {
    startY: 25,
    head: [["No", "Produk", "Total Qty", "Total Penjualan"]],
    body: productTableData,
    headStyles: {
      fillColor: [189, 9, 9],
      textColor: 255,
      fontStyle: 'bold'
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "copyright@2025 Devon Yura App | Basreng POS",
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // ========== RENDER CHART (Jika ada) ==========
  if (chartRefs && chartRefs.current && !isDayReport) {
    doc.addPage();

    // Tunggu chart selesai dirender (menggunakan requestAnimationFrame)
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      const chartWidth = chartRefs.current.offsetWidth;
      const chartHeight = chartRefs.current.offsetHeight;
      const aspectRatio = chartHeight / chartWidth;

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const targetWidth = pageWidth - margin * 2;
      const targetHeight = targetWidth * aspectRatio;

      // Konversi chart ke blob dan kemudian ke base64
      const blob = await toBlob(chartRefs.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: { transformOrigin: "top left" },
        quality: 0.8
      });
      if (!blob) throw new Error("Gagal membuat blob dari chart.");

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise((resolve) => {
        reader.onloadend = () => resolve(null);
      });
      const base64data = reader.result as string;

      // Tambahkan chart ke halaman PDF
      const x = (pageWidth - targetWidth) / 2;
      const y = 20;
      doc.addImage(base64data, "JPEG", x, y, targetWidth, targetHeight, undefined, "FAST");
    } catch (error) {
      // Jika chart gagal diambil, abaikan saja
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "copyright@2025 Devon Yura App | Basreng POS",
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Return dokumen PDF dan data
  return { doc, dataReal, startDate, endDate };
};

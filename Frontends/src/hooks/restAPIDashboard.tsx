import { BASE_API_URL, isApiOnline, checkOKResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

// =============================
// Tipe data untuk Ringkasan Penjualan
// =============================
export interface TransactionSummary {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
  jumlah_transaksi_hari_ini: number;
}

// =============================
// Tipe data untuk Pendapatan per Cabang
// =============================
export interface BranchIncome {
  branch_id: string;
  branch_name: string;
  total_transactions: string;
  total_income: string;
}

// =============================
// Tipe data untuk Pendapatan per Cabang
// =============================
export interface TopSelling {
  name: string;
  total_sold: string;
}



export interface ProductCategorySummary {
  category: string;
  total: string;
}

// =============================
// Fetch Ringkasan Penjualan
// =============================
export const getTransactionSummary = async (): Promise<TransactionSummary | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/report/summary`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return error;
  }
};

// =============================
// Fetch Ringkasan Penjualan
// =============================
export const getTopSellingProduct = async (): Promise<TopSelling | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/report/top-selling`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching product top selling:", error);
    return error;
  }
};

// =============================
// Fetch Pendapatan per Cabang
// =============================
export const getIncomeByBranch = async (): Promise<BranchIncome[] | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/report/getBranchReport`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching income by branch:", error);
    return error;
  }
};

// =============================
// Fetch Data Chart: 7 Hari Terakhir
// =============================
export interface ChartIncomeLast7days {
  date: string;
  total_sales: string;
}
export const getReport = async (days: any = ''): Promise<ChartIncomeLast7days[] | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/report/getReport?day=${days}`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chart last 7 days:", error);
    return error;
  }
};

export const getTransactionsReport = async (days: any = ''): Promise<ChartIncomeLast7days[] | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/report/getTransactionsReport/${days}`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching chart", error);
    return error;
  }
};

// =============================
// Tipe data untuk Chart (Line, Pie, Bar)
// =============================

// =============================
// Fetch Data Chart: Kategori Produk
// =============================
export interface ChartIncomeByBranch {
  branch_name: string;
  total_income: string;
}
export const getCategorySummary = async (): Promise<ProductCategorySummary[] | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/chart/category-summary`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching category summary:", error);
    return error;
  }
};

// src/api/restAPIReport.ts

import Cookies from "js-cookie";
import { BASE_API_URL, isApiOnline, checkOKResponse } from "./restAPIRequest";

// ======================
// INTERFACES
// ======================

export interface PaymentSummary {
  cash: number;
  transfer_bank: number;
  qris: number;
  shopee: number;
}

export interface SummaryReport {
  total_sales: number;
  total_transactions: number;
  payment_summary: PaymentSummary;
}

export interface BranchReport {
  branch_id: string;
  branch_name: string;
  total_transactions: string;
  total_income: string;
}

export interface ChartData {
  labels: string[];
  datasets: Record<string, any>; // fleksibel (array atau object)
}

export interface ReportResponse {
  status: string;
  type: "daily" | "range" | "monthly";
  summary: SummaryReport;
  branches: BranchReport[];
  chart: ChartData;
}

// ======================
// API FUNCTIONS
// ======================

const getHeaders = () => {
  const TOKEN = Cookies.get("token");
  return {
    Authorization: `Bearer ${TOKEN}`,
  };
};

// DAILY
export const getDailyReport = async (): Promise<ReportResponse> => {
  const apiOnline = await isApiOnline();
  if (!apiOnline) throw new Error("Server offline");

  const response = await fetch(`${BASE_API_URL}/api/reports/daily`, {
    method: "GET",
    headers: getHeaders(),
  });

  checkOKResponse(response);
  return await response.json();
};

// RANGE
export const getRangeReport = async (days: string): Promise<ReportResponse> => {
  const apiOnline = await isApiOnline();
  if (!apiOnline) throw new Error("Server offline");

  const response = await fetch(
    `${BASE_API_URL}/api/reports/range?days=${days}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  checkOKResponse(response);
  return await response.json();
};

// MONTHLY
export const getMonthlyReport = async (month: string): Promise<ReportResponse> => {
  const apiOnline = await isApiOnline();
  if (!apiOnline) throw new Error("Server offline");

  const response = await fetch(
    `${BASE_API_URL}/api/reports/monthly?month=${month}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  checkOKResponse(response);
  return await response.json();
};
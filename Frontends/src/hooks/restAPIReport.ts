// src/api/restAPIReport.tsx

import Cookies from "js-cookie";
import { BASE_API_URL, isApiOnline, checkOKResponse } from "./restAPIRequest";
import { AllReportsResponse, AllDetailReportsResponse } from "./interfaces";

export const getAllReports = async (day: string = '', month: string = '', year: string = ''): Promise<AllReportsResponse | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/report/getAllReports?day=${day}&month=${month}&year=${year}`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data: AllReportsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    return error;
  }
};

export const getDetailReport = async (date: string = ''): Promise<AllDetailReportsResponse | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server.");

    const url = `${BASE_API_URL}/api/report/getDetailReport/${date}`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    checkOKResponse(response);
    const data: AllDetailReportsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    return error;
  }
};

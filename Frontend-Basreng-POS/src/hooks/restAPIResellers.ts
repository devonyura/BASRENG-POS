import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

export interface Reseller {
  id?: string;
  name?: string;
  phone?: string;
  address?: string;
}

export interface ResellerPayload {
  name?: string;
  phone?: string;
  address?: string;
}

export const getResellers = async (): Promise<Reseller[] | any> => {
  try {
    const TOKEN = Cookies.get("token");

    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");

    const response = await fetch(`${BASE_API_URL}/api/resellers`, {
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
    console.error("Error fetching resellers:", error);
    return error;
  }
};

export const createReseller = async (payload: ResellerPayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");

      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/resellers`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      checkOKResponse(response);

      const data = await response.json();
      resolve({ success: true, data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal menambah reseller:", error);
      reject("Gagal menambah reseller: " + errorMessage);
    }
  });
};

export const updateReseller = async (payload: ResellerPayload, id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");

      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/resellers/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      checkOKResponse(response);

      const data = await response.json();
      resolve({ success: true, data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal update reseller:", error);
      reject("Gagal update reseller: " + errorMessage);
    }
  });
};

export const deleteReseller = async (id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");

      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/resellers/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
      });

      checkOKResponse(response);

      const data = await response.json();
      resolve({ success: true, data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal hapus reseller:", error);
      reject("Gagal hapus reseller: " + errorMessage);
    }
  });
};

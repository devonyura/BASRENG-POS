// restAPIBranch.tsx

import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

// Tipe untuk data cabang
export interface Branch {
  branch_id?: string;
  branch_name?: string;
  branch_address?: string;
}

// Tipe untuk payload kirim data
export interface BranchPayload {
  branch_name?: string;
  branch_address?: string;
}

// Ambil semua cabang
export const getBranches = async (): Promise<Branch[] | any> => {
  try {
    const TOKEN = Cookies.get("token");

    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");

    const response = await fetch(`${BASE_API_URL}/api/branch`, {
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
    console.error("Error fetching branches:", error);
    return error;
  }
};

// Ambil satu cabang berdasarkan ID
export const getBranchById = async (id: string): Promise<Branch | any> => {
  try {
    const TOKEN = Cookies.get("token");

    const apiOnline = await isApiOnline();
    if (!apiOnline) throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");

    const response = await fetch(`${BASE_API_URL}/api/branch/${id}`, {
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
    console.error("Error fetching branch:", error);
    return error;
  }
};

// Tambah cabang baru
export const createBranch = async (payload: BranchPayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");

      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/branch`, {
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
      console.log("Gagal menambah cabang:", error);
      reject("Gagal menambah cabang: " + errorMessage);
    }
  });
};

// Update data cabang
export const updateBranch = async (payload: BranchPayload, id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");

      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/branch/${id}`, {
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
      console.log("Gagal update cabang:", error);
      reject("Gagal update cabang: " + errorMessage);
    }
  });
};

// Hapus cabang
export const deleteBranch = async (id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");

      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/branch/${id}`, {
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
      console.log("Gagal hapus cabang:", error);
      reject("Gagal hapus cabang: " + errorMessage);
    }
  });
};

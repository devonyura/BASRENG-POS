import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

export interface Package {
  id: string;
  name: string;
  price: string;
}

export interface PackagePayload {
  name: string;
  price: string;
}

export interface UpdatePackagePayload {
  id: string;
  name: string;
  price: string;
}

export const createPackage = async (packagePayload: PackagePayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("API:", packagePayload)
    try {
      // Ambil token JWT dari localStorage
      const TOKEN = Cookies.get("token");

      // Cek apakah API online
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      console.warn(packagePayload);
      // Konfigurasi request dengan header Authorization
      const response = await fetch(`${BASE_API_URL}/api/packages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(packagePayload),
      });

      // Check Response
      checkOKResponse(response)

      // Ubah data ke json format
      const data = await response.json();

      console.info("Status Request Create Transaction : ", data.status);

      resolve({ success: true, data });

    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal menambah Produk:", error);
      reject("Gagal menambah Produk: " + errorMessage);
    }
  });
};

export const updatePackage = async (updatePackagePayload: UpdatePackagePayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("API:", updatePackagePayload)
    try {
      // Ambil token JWT dari localStorage
      const TOKEN = Cookies.get("token");

      // Cek apakah API online
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      console.warn(updatePackagePayload);
      // Konfigurasi request dengan header Authorization
      const response = await fetch(`${BASE_API_URL}/api/packages/${updatePackagePayload.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(updatePackagePayload),
      });

      // Check Response
      checkOKResponse(response)

      // Ubah data ke json format
      const data = await response.json();

      console.info("Status Request Save Transaction : ", data.status);

      resolve({ success: true, data });

    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal edit Produk:", error);
      reject("Gagal edit Produk: " + errorMessage);
    }
  });
};

export const deletePackage = async (id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("package.id:", id)
    try {
      // Ambil token JWT dari localStorage
      const TOKEN = Cookies.get("token");

      // Cek apakah API online
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      console.warn(id);
      // Konfigurasi request dengan header Authorization
      const response = await fetch(`${BASE_API_URL}/api/packages/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        }
      });

      // Check Response
      checkOKResponse(response)

      // Ubah data ke json format
      const data = await response.json();

      console.info("Status Request Delete Package : ", data.status);

      resolve({ success: true, data });

    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal edit Produk:", error);
      reject("Gagal edit Produk: " + errorMessage);
    }
  });
};

export const getPackages = async (): Promise<Package | any> => {
  try {
    // Ambil token JWT dari localStorage
    const TOKEN = Cookies.get("token");

    // Cek apakah API online
    const apiOnline = await isApiOnline();
    if (!apiOnline) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }


    const url = `${BASE_API_URL}/api/packages`;

    // Konfigurasi request dengan header Authorization
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    // Check Response
    checkOKResponse(response);

    // Ubah data ke json format
    const data = await response.json();

    return data.data;

  } catch (error) {
    console.error("Error Fetching transactions", error);
    return error;
  }
};

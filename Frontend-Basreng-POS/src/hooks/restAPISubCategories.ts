import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

export interface SubCategory {
  id: string; // ini id dari categories
  id_categories: string; // ini id dari categories
  name: string;
}

export interface SubCategoryPayload {
  name: string;
  category_id: string;
}

export interface SubCategoriesPayload {
  id_categories: string | null; // ini id dari categories
  name: string;
}

export const getSubCategoriesbyCategory = async (id_category: string) => {
  try {
    // Ambil token JWT dari localStorage
    const TOKEN = Cookies.get("token");

    // Cek apakah API online
    const apiOnline = await isApiOnline();
    if (!apiOnline) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }


    const url = `${BASE_API_URL}/api/subcategories?id_categories=${id_category}`;

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

    // console.log(data);

    return data.data;

  } catch (error) {
    console.error("Error Fetching transactions", error);
    return error;
  }
};

export const createSubCategory = async (subCategoriesPayload: SubCategoriesPayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("API:", subCategoriesPayload)
    try {
      // Ambil token JWT dari localStorage
      const TOKEN = Cookies.get("token");

      // Cek apakah API online
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      console.warn(subCategoriesPayload);
      // Konfigurasi request dengan header Authorization
      const response = await fetch(`${BASE_API_URL}/api/subcategories`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(subCategoriesPayload),
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

export const updateSubCategory = async (updateCategoriesPayload: SubCategoriesPayload, id: string | number): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("API:", updateCategoriesPayload)
    try {
      // Ambil token JWT dari localStorage
      const TOKEN = Cookies.get("token");

      // Cek apakah API online
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      console.warn(updateCategoriesPayload);
      // Konfigurasi request dengan header Authorization
      const response = await fetch(`${BASE_API_URL}/api/subcategories/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(updateCategoriesPayload),
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

export const deleteSubCategory = async (id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {

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
      const response = await fetch(`${BASE_API_URL}/api/subcategories/${id}`, {
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

      console.info("Status Request Delete Categories : ", data.status);

      resolve({ success: true, data });

    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal edit Kategori:", error);
      reject("Gagal edit Kategori: " + errorMessage);
    }
  });
};


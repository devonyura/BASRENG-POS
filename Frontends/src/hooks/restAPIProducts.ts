import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

export interface Product {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  name: string;
  price: string;
  created_at: string;
}

export interface ProductPayload {
  category_id: string;
  subcategory_id: string | null;
  name: string;
  price: string;
}

export interface UpdateProductPayload {
  id: string;
  category_id: string;
  subcategory_id: string | null | undefined;
  name: string;
  price: string;
}

export const createProduct = async (productPayload: ProductPayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("API:", productPayload)
    try {
      // Ambil token JWT dari localStorage
      const TOKEN = Cookies.get("token");

      // Cek apakah API online
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      console.warn(productPayload);
      // Konfigurasi request dengan header Authorization
      const response = await fetch(`${BASE_API_URL}/api/products`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(productPayload),
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

export const updateProduct = async (updateProductPayload: UpdateProductPayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("API:", updateProductPayload)
    try {
      // Ambil token JWT dari localStorage
      const TOKEN = Cookies.get("token");

      // Cek apakah API online
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      console.warn(updateProductPayload);
      // Konfigurasi request dengan header Authorization
      const response = await fetch(`${BASE_API_URL}/api/products/${updateProductPayload.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(updateProductPayload),
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

export const deleteProduct = async (id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    console.log("product.id:", id)
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
      const response = await fetch(`${BASE_API_URL}/api/products/${id}`, {
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

      console.info("Status Request Delete Product : ", data.status);

      resolve({ success: true, data });

    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.log("Gagal edit Produk:", error);
      reject("Gagal edit Produk: " + errorMessage);
    }
  });
};

export const getProducts = async (): Promise<Product | any> => {
  try {
    // Ambil token JWT dari localStorage
    const TOKEN = Cookies.get("token");

    // Cek apakah API online
    const apiOnline = await isApiOnline();
    if (!apiOnline) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }


    const url = `${BASE_API_URL}/api/products`;

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


import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

export interface ProductVariant {
  id: number;
  product_id: number;
  weight_grams: number;
  price: number;
}

export interface ProductVariantPayload {
  product_id: number;
  weight_grams: number;
  price: number;
}

export interface UpdateProductVariantPayload {
  id: number;
  product_id: number;
  weight_grams: number;
  price: number;
}

export const createVariant = async (
  payload: ProductVariantPayload
): Promise<ApiResponse> => {

  const TOKEN = Cookies.get("token");

  const response = await fetch(`${BASE_API_URL}/api/product-variants`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  checkOKResponse(response);

  return {
    success: true,
    data: await response.json(),
  };
};

export const updateVariant = async (
  payload: UpdateProductVariantPayload
): Promise<ApiResponse> => {

  const TOKEN = Cookies.get("token");

  const response = await fetch(
    `${BASE_API_URL}/api/product-variants/${payload.id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    }
  );

  checkOKResponse(response);

  return {
    success: true,
    data: await response.json(),
  };
};

export const deleteVariant = async (id: number): Promise<ApiResponse> => {
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
      const response = await fetch(`${BASE_API_URL}/api/product-variants/${id}`, {
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

export const getVariantsByProduct = async (
  id: number
): Promise<ProductVariant[]> => {
  try {
    const TOKEN = Cookies.get("token");

    const response = await fetch(
      `${BASE_API_URL}/api/product-variants/product/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    checkOKResponse(response);

    const json = await response.json();

    console.log("RAW VARIANT RESPONSE:", json);

    // ✅ SUPPORT 2 RESPONSE FORMAT
    const rawData = Array.isArray(json)
      ? json
      : json.data ?? [];

    return rawData.map((v: any) => ({
      id: Number(v.id),
      product_id: Number(v.product_id),
      weight_grams: Number(v.weight_grams),
      price: Number(v.price),
    }));

  } catch (error) {
    console.error("Fetch Variant Error", error);
    return [];
  }
};
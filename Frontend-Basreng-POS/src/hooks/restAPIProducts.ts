import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

// Base field yang sama
export interface BaseProductPayload {
  category_id: number | null;
  subcategory_id?: string | null;
  name: string;
  // price: string;
  // weight_grams: string;
  descriptions: string | null;
}

// Untuk CREATE
export interface CreateProductPayload extends BaseProductPayload {
  img?: File;
}

// Untuk UPDATE
export interface UpdateProductPayload extends BaseProductPayload {
  id: number;
  img?: File | null;
}

export interface ProductVariant {
  variant_id: string;
  weight_grams: string;
  price: string;
}

export interface Product {
  id: string;
  name: string;
  img: string | null;
  category_id: number | null;
  variants: ProductVariant[];
}


export interface ProductWithVariant {
  id: string;
  name: string;
  img: string | null;
  category_id: number | null;
  variants: ProductVariant[];
}

export interface CreateProductResponse {
  message: string;
  product: Product;
}

export interface ProductPayload {
  category_id: number | null;
  subcategory_id?: string | null | undefined;
  name: string;
  // price: string;
  // weight_grams: string;
  descriptions: string | null;
  img?: File | null;
}

// export interface UpdateProductPayload {
//   id: string;
//   category_id: string;
//   subcategory_id: string | null | undefined;
//   name: string;
//   img?: File | null;
//   price: string;
//   weight_grams: string;
//   descriptions: string | null;
// }

export const createProduct = async (
  productPayload: ProductPayload
): Promise<CreateProductResponse> => {

  const TOKEN = Cookies.get("token");

  const formData = new FormData();

  Object.entries(productPayload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as any);
    }
  });

  console.log("Product:", formData);

  const response = await fetch(`${BASE_API_URL}/api/products`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
    body: formData,
  });

  console.log("formData:", formData)
  checkOKResponse(response);

  const data = await response.json();

  return { message: "true", product: data };
};

export const updateProduct = async (
  payload: UpdateProductPayload
): Promise<ApiResponse> => {

  const TOKEN = Cookies.get("token");

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as any);
    }
  });

  const response = await fetch(
    `${BASE_API_URL}/api/products/update/${payload.id}`, // ✅ kirim id di URL
    {
      method: "POST", // atau PUT (lihat note bawah)
      credentials: "include",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      body: formData,
    }
  );

  checkOKResponse(response);

  return {
    success: true,
    data: await response.json(),
  };
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

export const getProducts = async (): Promise<ProductWithVariant[]> => {
  try {
    // Ambil token JWT dari localStorage
    const TOKEN = Cookies.get("token");

    // Cek apakah API online
    const apiOnline = await isApiOnline();
    if (!apiOnline) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }


    const url = `${BASE_API_URL}/api/products/get-with-variant`;

    // Konfigurasi request dengan header Authorization
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
      },
    });

    // Check Response
    checkOKResponse(response);

    // Ubah data ke json format
    const data = await response.json();

    return data.data;

  } catch (error: any) {
    console.error("Error Fetching transactions", error);
    return error;
  }
};

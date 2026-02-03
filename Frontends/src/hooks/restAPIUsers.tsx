import { BASE_API_URL, isApiOnline, checkOKResponse, ApiResponse } from "./restAPIRequest";
import Cookies from "js-cookie";

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role: string;
}

export interface ResetPasswordPayload {
  username: string;
  old_password: string;
  new_password: string;
}

// Get all users
export const getUsers = async (): Promise<User[] | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }

    const url = `${BASE_API_URL}/api/users`;
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
    console.error("Error fetching users:", error);
    return error;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | any> => {
  try {
    const TOKEN = Cookies.get("token");
    const apiOnline = await isApiOnline();
    if (!apiOnline) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }

    const url = `${BASE_API_URL}/api/users/${id}`;
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
    console.error("Error fetching user by ID:", error);
    return error;
  }
};

// Create user
export const createUser = async (payload: CreateUserPayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/users`, {
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
      console.error("Gagal menambah user:", error);
      reject("Gagal menambah user: " + errorMessage);
    }
  });
};

// Reset password
export const resetUserPassword = async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/users/reset-password`, {
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
      console.error("Gagal reset password:", error);
      reject("Gagal reset password: " + errorMessage);
    }
  });
};

// Delete user
export const deleteUser = async (id: string): Promise<ApiResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const TOKEN = Cookies.get("token");
      const apiOnline = await isApiOnline();
      if (!apiOnline) {
        reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/users/${id}`, {
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
      console.error("Gagal hapus user:", error);
      reject("Gagal hapus user: " + errorMessage);
    }
  });
};

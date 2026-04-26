import React from "react";
import Cookies from "js-cookie";

export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const FILE_BASE_URL =
	`${BASE_API_URL}${import.meta.env.VITE_FILE_BASE_PATH || '/uploads/products'}`;

export interface ApiResponse {
	success: boolean;
	data?: any;
	error?: string;
}

export interface ProductVariant {
	variant_id: number
	product_id: number
	weight_grams: number
	price: number
}

export interface DataProduct {
	id: number
	name: string
	category_id: number
	descriptions?: string
	img?: string
	variants?: ProductVariant[]
}

export interface Categories {
	id: string;
	name: string;
}

export interface Student {
	id: string;
	name: string;
	address: string;
	gender: string;
}

export interface Auth {
	username: string;
	password: string;
}

export interface TransactionPayload {
	transaction: Transaction;
	transaction_details: TransactionDetails[];
	is_reseller?: boolean;
	reseller_id?: number | null;
}

interface Transaction {
	transaction_code: string;
	user_id: number;
	branch_id: number;
	date_time: string,
	total_price: number;
	cash_amount: number | null;
	change_amount: number;
	payment_method: string;
	is_online_order: boolean | number;
	customer_name: string | null;
	customer_address: string | null;
	customer_phone: string | null;
	notes: string | null;
	reseller_id: number | null;
	transaction_type: string | null;
	shopee_code: string | null | undefined;
}

interface TransactionDetails {
	product_id: number;
	variant_id: number;
	quantity: number;
	price: number;
	subtotal: number;
	weight_grams?: number;
}

export interface DataToken {
	status: string;
	message: string;
	token: string;
}

export const isApiOnline = async (): Promise<boolean | any> => {
	try {
		const response = await fetch(`${BASE_API_URL}/api/ping`, { method: "HEAD" });
		return response.ok;
	} catch (error) {
		console.warn("API Offline:", error);
		return false;
	}
};

export const loginRequest = async (authData: Auth): Promise<ApiResponse> => {
	return new Promise(async (resolve, reject) => {
		try {

			// Cek apakah API online
			const apiOnline = await isApiOnline();
			if (!apiOnline) {
				reject("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
				return;
			}

			// Konfigurasi request dengan header Authorization
			const response = await fetch(`${BASE_API_URL}/api/auth/login`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(authData),
			});

			// Check Response
			checkOKResponse(response)

			// Ubah data ke json format
			const data: DataToken = await response.json();

			console.info("Status Request loginRequest() : ", data.status);

			resolve({ success: true, data });

		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
			console.log("Error Login:", error);
			reject("Username atau Password salah!.");
		}
	});
};

export const checkOKResponse = (response: any) => {
	// console.log(response);
	if (!response.ok) {
		if (response.status === 401) {
			console.error("Unauthorized! Token mungkin sudah expired/salah.")
		}
		throw new Error(`HTTP error! Status: ${response.status}`)
	}
}

export const getDataProducts = async () => {
	try {
		// Ambil token JWT dari localStorage
		const TOKEN = Cookies.get("token");

		// Cek apakah API online
		const apiOnline = await isApiOnline();
		if (!apiOnline) {
			throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
		}

		// Konfigurasi request dengan header Authorization
		const response = await fetch(`${BASE_API_URL}/api/products/get-with-variant`, {
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

		console.info("Status Request getDataProducts() : ", data.status);
		console.info("Data products : ", data.data);

		// set State student
		// setProducts(data.data);

		// return product data
		return data.data;

	} catch (error) {
		// Kirim error jika gagal request
		console.error("Error Products", error);
		return error;
	}
};

export const getCategories = async () => {
	try {
		// Ambil token JWT dari localStorage
		const TOKEN = Cookies.get("token");

		// Cek apakah API online
		const apiOnline = await isApiOnline();
		if (!apiOnline) {
			throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
		}

		// Konfigurasi request dengan header Authorization
		const response = await fetch(`${BASE_API_URL}/api/categories`, {
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

		console.info(data);
		console.info("Status Request getCategories() : ", data.status);
		console.info("Data categories : ", data.data);

		// set State student
		// setProducts(data.data);

		// return product data
		return data.data;

	} catch (error) {
		// Kirim error jika gagal request
		console.error("Error Fetching categories", error);
		return error;
	}
};

export const getSubCategories = async () => {
	try {
		// Ambil token JWT dari localStorage
		const TOKEN = Cookies.get("token");

		// Cek apakah API online
		const apiOnline = await isApiOnline();
		if (!apiOnline) {
			throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
		}

		// Konfigurasi request dengan header Authorization
		const response = await fetch(`${BASE_API_URL}/api/subcategories`, {
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

		console.info(data);
		console.info("Status Request getCategories() : ", data.status);
		console.info("Data categories : ", data.data);

		// set State student
		// setProducts(data.data);

		// return product data
		return data.data;

	} catch (error) {
		// Kirim error jika gagal request
		console.error("Error Fetching categories", error);
		return error;
	}
};

export const getBranch = async (id: number | null = null) => {
	try {
		// Ambil token JWT dari localStorage
		const TOKEN = Cookies.get("token");

		// Cek apakah API online
		const apiOnline = await isApiOnline();
		if (!apiOnline) {
			throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
		}

		// Konfigurasi request dengan header Authorization
		const response = await fetch(`${BASE_API_URL}/api/branch/${id}`, {
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

		// console.info(data);

		// set State student
		// setProducts(data.data);

		// return product data
		return data;

	} catch (error) {
		// Kirim error jika gagal request
		console.error("Error Fetching categories", error);
		return error;
	}
};

interface TransactionFilter {
	username?: string | null;
	branch?: number;
	start_date?: string; // format ISO string (contoh: "2024-05-14")
	end_date?: string;
}

export const getTransactionHistory = async (filter: TransactionFilter = {}) => {
	try {
		// Ambil token JWT dari localStorage
		const TOKEN = Cookies.get("token");

		// Cek apakah API online
		const apiOnline = await isApiOnline();
		if (!apiOnline) {
			throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
		}

		// bangun query string berdasarkan filter
		const queryParams = new URLSearchParams();
		if (filter.username) queryParams.append("username", filter.username);
		if (filter.branch) queryParams.append("branch", String(filter.branch));
		if (filter.start_date) queryParams.append("start_date", filter.start_date);
		if (filter.end_date) queryParams.append("end_date", filter.end_date);

		const queryString = queryParams.toString();
		const url = `${BASE_API_URL}/api/transactions${queryString ? `?${queryString}` : ""}`;

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

export const findTransactionHistory = async (transactionCode: string) => {
	try {
		// Ambil token JWT dari localStorage
		const TOKEN = Cookies.get("token");

		// Cek apakah API online
		const apiOnline = await isApiOnline();
		if (!apiOnline) {
			throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
		}


		const url = `${BASE_API_URL}/api/transactions/${transactionCode}`;

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

export const createTransaction = async (transactionPayload: TransactionPayload): Promise<ApiResponse> => {
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

			console.warn(transactionPayload);
			// Konfigurasi request dengan header Authorization
			const response = await fetch(`${BASE_API_URL}/api/transactions`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${TOKEN}`,
				},
				body: JSON.stringify(transactionPayload),
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
			console.log("Gagal menambah transaksi:", error);
			reject("Gagal menambah transaksi: " + errorMessage);
		}
	});
};

export const saveData = async (newStudents: object): Promise<ApiResponse> => {
	return new Promise(async (resolve, reject) => {
		try {
			// Ambil token JWT dari localStorage
			const TOKEN = Cookies.get("token");

			// Cek apakah API online
			const apiOnline = await isApiOnline();
			if (!apiOnline) {
				resolve({ success: false, error: "Tidak dapat terhubung ke server. Periksa koneksi Anda." });
				return { success: false, error: "Tidak dapat terhubung ke server. Periksa koneksi Anda." };
			}

			// Konfigurasi request dengan header Authorization
			const response = await fetch(`${BASE_API_URL}/api/siswa`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${TOKEN}`,
				},
				body: JSON.stringify(newStudents),
			});

			// Check Response
			checkOKResponse(response);

			// Ubah data ke json format
			const data = await response.json();

			console.info("Status Request saveData() : ", data.status);
			resolve({ success: true, data });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
			console.error("Error Fetching Students:", error);
			reject({ success: false, error: errorMessage || "Terjadi kesalahan" });
		}
	});
};

// Function untuk menghapus data siswa berdasarkan ID
export const deleteData = async (id: string): Promise<ApiResponse> => {
	return new Promise(async (resolve, reject) => {
		try {

			// Ambil token JWT dari localStorage
			const TOKEN = Cookies.get("token");

			// Cek apakah API online
			const apiOnline = await isApiOnline();
			if (!apiOnline) {
				reject({ success: false, error: "Tidak dapat terhubung ke server. Periksa koneksi Anda." });
				return
			}

			// Konfigurasi request dengan header Authorization
			const response = await fetch(`${BASE_API_URL}/api/siswa/${id}`, {
				method: "DELETE",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${TOKEN}`,
				}
			});

			// Check Response
			checkOKResponse(response);

			// Ubah data ke json format
			const data = await response.json();

			console.info("Status Request deleteData() : ", data.status);
			resolve({ success: true });

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
			console.error("Error Deleting Student:", errorMessage);
			reject({ success: false, error: errorMessage });
		}
	});
};

export const updateData = async (id: string, updatedStudent: object): Promise<ApiResponse> => {
	return new Promise(async (resolve, reject) => {
		try {

			// Ambil token JWT dari localStorage
			const TOKEN = Cookies.get("token");

			// Cek apakah API online
			const apiOnline = await isApiOnline();
			if (!apiOnline) {
				reject({ success: false, error: "Tidak dapat terhubung ke server. Periksa koneksi Anda." });
				return;
			}

			// Konfigurasi request dengan header Authorization
			const response = await fetch(`${BASE_API_URL}/api/siswa/${id}`, {
				method: "PUT",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${TOKEN}`,
				},
				body: JSON.stringify(updatedStudent),
			});

			// Check Response
			checkOKResponse(response);

			// Ubah data ke json format
			const data = await response.json();

			console.info("Status Request updateData() : ", data.status);
			resolve({ success: true, data });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
			console.error("Error Editing Student:", error);
			reject({ success: false, error: errorMessage });
		}
	});
};

export const uploadPaymentProof = async (
	file: File,
	transactionCode: string
): Promise<ApiResponse> => {
	return new Promise(async (resolve, reject) => {
		try {
			const TOKEN = Cookies.get("token");

			const apiOnline = await isApiOnline();
			if (!apiOnline) {
				resolve({
					success: false,
					error: "Tidak dapat terhubung ke server.",
				});
				return;
			}

			const formData = new FormData();
			formData.append("file", file);
			formData.append("transaction_code", transactionCode);

			const response = await fetch(
				`${BASE_API_URL}/api/payment-proofs/upload`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						Authorization: `Bearer ${TOKEN}`,
						// ❗ JANGAN pakai Content-Type di FormData
					},
					body: formData,
				}
			);

			checkOKResponse(response);

			const data = await response.json();

			console.info("Upload Payment Proof:", data);

			resolve({
				success: true,
				data: data,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Terjadi kesalahan";

			console.error("Error uploadPaymentProof:", error);

			reject({
				success: false,
				error: errorMessage,
			});
		}
	});
};

export const getPaymentProofByTransaction = async (
	transactionCode: string
): Promise<ApiResponse> => {
	return new Promise(async (resolve, reject) => {
		try {
			const TOKEN = Cookies.get("token");

			const apiOnline = await isApiOnline();
			if (!apiOnline) {
				resolve({
					success: false,
					error: "Tidak dapat terhubung ke server"
				})
			}

			const response = await fetch(
				`${BASE_API_URL}/api/payment-proofs/transaction/${transactionCode}`,
				{
					method: "GET",
					credentials: "include",
					headers: {
						Authorization: `Bearer ${TOKEN}`,
					},
				}
			)

			checkOKResponse(response);

			const data = await response.json();

			resolve({
				success: true,
				data: data.data
			});
		} catch (error) {
			reject({
				success: false,
				error: error instanceof Error ? error.message : "Error",
			})
		}
	})
}

export const generateReceiptImage = async (payload: any) => {
	try {
		const res = await fetch(
			"https://receipt-service-production-1a48.up.railway.app/api/generate-receipt",
			// "http://localhost:3000/api/generate-receipt",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload)
			}
		)

		const result = await res.json()

		if (!result.success) {
			throw new Error("Gagal generate image")
		}

		return result.data.base64;
	} catch (err) {
		throw err;
	}
}

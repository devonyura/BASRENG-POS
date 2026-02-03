import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getDataProducts, DataProduct } from "../hooks/restAPIRequest";

// Initial state Definition
interface ProductState {
  products: DataProduct[];
  isLoading: boolean;
  error: string | null | DataProduct[];
}

const initialState: ProductState = {
  products: [],
  isLoading: false,
  error: null
}

// Thunk for get product with async method
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDataProducts();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      return rejectWithValue("Fail Get Product from server!");
    }
  }
)

// Make Slice
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<DataProduct[]>) => {
        state.isLoading = false;

        // Jika `action.payload` adalah error, masukkan ke state.error
        if (action.payload instanceof Error || typeof action.payload === "string") {
          state.error = action.payload; // Simpan error
          state.products = []; // Kosongkan produk
        } else {
          state.products = action.payload; // Simpan data produk
          state.error = null; // Reset error jika berhasil
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string | null;
        state.products = [];
      })
  },
});

export default productsSlice.reducer;

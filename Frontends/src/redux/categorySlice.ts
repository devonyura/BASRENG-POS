// redux/categorySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCategories } from "../hooks/restAPIRequest";

interface CategoryState {
  categories: any[];
  isLoading: boolean;
  error: any;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, thunkAPI) => {
    try {
      const response = await getCategories();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload instanceof Error || typeof action.payload === "string") {
          state.error = action.payload;
          state.categories = [];
        } else {
          state.categories = action.payload;
          state.error = null;
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Gagal mengambil kategori.";
        state.categories = [];
      });
  },
});

export default categorySlice.reducer;

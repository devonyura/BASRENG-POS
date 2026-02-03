import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSubCategories } from "../hooks/restAPIRequest";

interface SubCategory {
  id: string;
  id_categories: string;
  name: string;
}

interface SubCategoryState {
  subCategories: SubCategory[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubCategoryState = {
  subCategories: [],
  isLoading: false,
  error: null,
}

export const fetchSubCategories = createAsyncThunk(
  'subCategories/fetchSubCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getSubCategories()
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

const subCategoriesSlice = createSlice({
  name: 'subCategories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.subCategories = action.payload
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export default subCategoriesSlice.reducer
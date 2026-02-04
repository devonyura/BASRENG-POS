import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productSlice";
import categoriesReducer from "./categorySlice";
import subCategoryReducer from "./subCategorySlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    subCategories: subCategoryReducer,
    cart: cartReducer,
  },
});

// Create three state and dispatch for usability | mudah digunakan
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
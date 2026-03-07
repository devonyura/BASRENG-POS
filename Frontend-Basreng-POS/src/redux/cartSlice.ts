// src/redux/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  variant_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  descriptions?: string;
  weight_grams: number;
  subtotal: number;
}


interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    addToCart: (state, action: PayloadAction<CartItem>) => {
      
      const existingItem = state.items.find(
        item => item.variant_id === action.payload.variant_id
      )

      if (existingItem) {
        existingItem.quantity += action.payload.quantity
        existingItem.subtotal = existingItem.price * existingItem.quantity
      } else {
        state.items.push({
          ...action.payload,
          subtotal: action.payload.price * action.payload.quantity
        })
      }
    },

    updateQty: (state, action: PayloadAction<{ variant_id: number; quantity: number }>) => {
      const item = state.items.find(item => item.variant_id === action.payload.variant_id)
      if (item) {
        item.quantity = action.payload.quantity
        item.subtotal = item.price * item.quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.variant_id !== item.variant_id)
        }
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        item => item.variant_id !== action.payload
      )
    },
    
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addToCart, updateQty, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

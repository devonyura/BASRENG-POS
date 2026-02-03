import { RootState } from "./store";

export const selectorCartItems = (state: RootState) => state.cart.items

export const selectorCartTotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.subtotal, 0)
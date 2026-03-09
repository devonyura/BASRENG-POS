import React from "react";
import ProductCartItem from "../ProductCartItem";
import { CartItem } from "../../redux/cartSlice";

interface Props {
  items: CartItem[];
}

const CartItemList: React.FC<Props> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <ProductCartItem key={item.variant_id} item={item} />
      ))}
    </>
  );
};

export default React.memo(CartItemList);

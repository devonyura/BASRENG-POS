import React, { useEffect } from "react";
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon } from "@ionic/react";
import { add, remove, trashBin } from "ionicons/icons";
import { rupiahFormat } from "../hooks/formatting";
import { DataProduct } from '../hooks/restAPIRequest'

// Redux
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQty, removeFromCart } from "../redux/cartSlice";
import { RootState } from "../redux/store";

interface ProductCardProps {
  product: DataProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)

  const itemInCart = cartItems.find(item => item.id === product.id)
  const quantity = itemInCart?.quantity ?? 0
  const subtotal = itemInCart?.subtotal ?? 0

  const ensureItemInCart = (qty: number) => {
    if (!itemInCart) {
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: qty,
        subtotal: Number(product.price)
      }))
    }
  }

  const handleAdd = () => {
    ensureItemInCart(1);
    dispatch(updateQty({ id: product.id, quantity: quantity + 1 }))
  }

  const handleAutoSet = (qty: number) => {
    ensureItemInCart(qty);
    dispatch(updateQty({ id: product.id, quantity: qty }))
  }

  const handleRemove = () => {
    dispatch(updateQty({ id: product.id, quantity: quantity - 1 }))
  }

  const handleReset = () => {
    dispatch(removeFromCart(product.id))
  }

  return (
    <IonCard>
      <IonGrid>

        <IonCardHeader>
          <IonCardTitle>{product.name}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="amount price">
            <p>Harga: <span>{rupiahFormat(product.price)}</span></p>
          </div>
          <div className="amount">
            <p>Qty:</p>
            <IonButton shape="round" size="small" onClick={handleRemove}>
              <IonIcon slot="icon-only" icon={remove}></IonIcon>
            </IonButton>
            {quantity}
            <IonButton shape="round" size="small" onClick={handleAdd}>
              <IonIcon slot="icon-only" icon={add}></IonIcon>
            </IonButton>
            <IonButton shape="round" size="small" color="danger" onClick={handleReset}>
              <IonIcon slot="icon-only" icon={trashBin}></IonIcon>
            </IonButton>
          </div>
          <div className="amount">
            <IonButton shape="round" size="small" onClick={() => handleAutoSet(3)}>3</IonButton>
            <IonButton shape="round" size="small" onClick={() => handleAutoSet(6)}>6</IonButton>
            <IonButton shape="round" size="small" onClick={() => handleAutoSet(12)}>12</IonButton>
          </div>
          <div className="amount price">
            <p>Subtotal: <span>{rupiahFormat(subtotal)}</span></p>
          </div>
        </IonCardContent>
      </IonGrid>
    </IonCard>
  );
};

export default ProductCard;

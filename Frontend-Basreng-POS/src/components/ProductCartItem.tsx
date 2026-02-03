import React, { useEffect } from "react";
import { IonGrid, IonRow, IonCol, IonButton, IonIcon, IonItem } from "@ionic/react";
import { add, remove, trashBin } from "ionicons/icons";
import { rupiahFormat } from "../hooks/formatting";
import { DataProduct } from '../hooks/restAPIRequest'

// Redux
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQty, removeFromCart } from "../redux/cartSlice";
import { RootState } from "../redux/store";


const ProductCartItem: React.FC<any> = ({ product }) => {

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

  const handleRemove = () => {
    dispatch(updateQty({ id: product.id, quantity: quantity - 1 }))
  }

  const handleReset = () => {
    dispatch(removeFromCart(product.id))
  }

  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol size="9">
            <div className='amount title'>
              <b>{product.name}</b>
            </div>
            <div className='amount subtotal'>
              <p>Subtotal : <b>{rupiahFormat(subtotal)}</b></p>
            </div>
            <div className='amount'>
              <p>Qty:</p>
              <IonButton shape="round" size='default' onClick={handleRemove}>
                <IonIcon slot="icon-only" icon={remove}></IonIcon>
              </IonButton>
              <span>{quantity}</span>
              <IonButton shape="round" size='default' onClick={handleAdd}>
                <IonIcon slot="icon-only" icon={add}></IonIcon>
              </IonButton>
            </div>
          </IonCol>
          <IonCol class='col-trash' size="3">
            <IonButton shape="round" color={'danger'} size='default' onClick={handleReset}>
              <IonIcon slot="icon-only" icon={trashBin}></IonIcon>
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

export default ProductCartItem;

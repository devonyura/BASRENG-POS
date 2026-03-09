import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonItem,
} from "@ionic/react";

import { add, remove, trashBin } from "ionicons/icons";

import { rupiahFormat, formatProductName } from "../hooks/formatting";

import { useDispatch } from "react-redux";
import { updateQty, removeFromCart, CartItem } from "../redux/cartSlice";

interface ProductCartItemProps {
  item: CartItem;
}

const ProductCartItem: React.FC<ProductCartItemProps> = ({ item }) => {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(
      updateQty({
        variant_id: item.variant_id,
        quantity: item.quantity + 1,
      }),
    );
  };

  const handleRemove = () => {
    dispatch(
      updateQty({
        variant_id: item.variant_id,
        quantity: item.quantity - 1,
      }),
    );
  };

  const handleReset = () => {
    dispatch(removeFromCart(item.variant_id));
  };

  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol size="9">
            <div className="amount title">
              <b>{formatProductName(item.name, item.weight_grams)}</b>
            </div>

            <div className="amount subtotal">
              <p>
                Subtotal : <b>{rupiahFormat(item.subtotal)}</b>
              </p>
            </div>

            <div className="amount">
              <p>Qty:</p>

              <IonButton shape="round" size="default" onClick={handleRemove}>
                <IonIcon slot="icon-only" icon={remove}></IonIcon>
              </IonButton>

              <span>{item.quantity}</span>

              <IonButton shape="round" size="default" onClick={handleAdd}>
                <IonIcon slot="icon-only" icon={add}></IonIcon>
              </IonButton>
            </div>
          </IonCol>

          <IonCol class="col-trash" size="3">
            <IonButton
              shape="round"
              color={"danger"}
              size="default"
              onClick={handleReset}
            >
              <IonIcon slot="icon-only" icon={trashBin}></IonIcon>
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

export default React.memo(ProductCartItem);

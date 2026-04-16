// conponents/ProductCards.tsx
import React from "react";
import { IonCard, IonCardContent, IonButton, IonText } from "@ionic/react";

import { rupiahFormat, formatWeight } from "../hooks/formatting";
import { DataProduct, BASE_API_URL } from "../hooks/restAPIRequest";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  updateQty,
  removeFromCart,
  CartItem,
} from "../redux/cartSlice";
import { RootState } from "../redux/store";

import "./ProductCard.css";

interface ProductCardProps {
  product: DataProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const subtotal = cartItems
    .filter((i) => i.product_id === product.id)
    .reduce((sum, i) => sum + i.subtotal, 0);

  const addVariant = (variant: any) => {
    dispatch(
      addToCart({
        variant_id: variant.variant_id,
        product_id: product.id,
        name: product.name,
        price: variant.price,
        quantity: 1,
        descriptions: product.descriptions,
        weight_grams: variant.weight_grams,
        subtotal: variant.price,
      }),
    );
  };

  // =========== Arraging desctiptions
  const descriptionList = React.useMemo(() => {
    if (!product.descriptions) return [];
    return product.descriptions
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);
  }, [product.descriptions]);

  const increase = (variant_id: number) => {
    const item = cartItems.find((i) => i.variant_id === variant_id);
    if (!item) return;

    dispatch(
      updateQty({
        variant_id,
        quantity: item.quantity + 1,
      }),
    );
  };

  const decrease = (variant_id: number) => {
    const item = cartItems.find((i) => i.variant_id === variant_id);
    if (!item) return;

    dispatch(
      updateQty({
        variant_id,
        quantity: item.quantity - 1,
      }),
    );
  };

  const remove = (variant_id: number) => {
    dispatch(removeFromCart(variant_id));
  };

  // MapLookup cartMap
  const cartMap = React.useMemo(() => {
    const map: Record<number, CartItem> = {};
    cartItems.forEach((i) => {
      map[i.variant_id] = i;
    });
    return map;
  }, [cartItems]);

  return (
    <IonCard className="product-card">
      {/* IMAGE */}
      <img
        src={`${BASE_API_URL}/uploads/products/${product.img}`}
        className="product-img"
      />

      <IonCardContent>
        {/* NAME */}
        <IonText className="product-title">{product.name}</IonText>

        {descriptionList.length > 0 && (
          <ul className="product-description">
            {descriptionList.map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>
        )}

        {/* VARIANTS */}
        {product?.variants?.map((v) => {
          const item = cartMap[v.variant_id];
          const qty = item?.quantity ?? 0;

          return (
            <div key={`${product.id}-${v.variant_id}`} className="variant-row">
              <div className="variant-info">
                <span className="variant-weight">
                  {formatWeight(v.weight_grams)}
                </span>

                <span className="variant-price">{rupiahFormat(v.price)}</span>
              </div>

              <div className="variant-action">
                {qty === 0 ? (
                  <IonButton size="small" onClick={() => addVariant(v)}>
                    +
                  </IonButton>
                ) : (
                  <div className="qty-control">
                    <IonButton
                      color="danger"
                      size="small"
                      onClick={() => remove(v.variant_id)}
                    >
                      x
                    </IonButton>
                    <IonButton
                      size="small"
                      onClick={() => decrease(v.variant_id)}
                    >
                      -
                    </IonButton>

                    <span className="qty">{qty}</span>

                    <IonButton
                      size="small"
                      onClick={() => increase(v.variant_id)}
                    >
                      +
                    </IonButton>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* SUBTOTAL */}
        {subtotal > 0 && (
          <div className="subtotal">SubTotal: {rupiahFormat(subtotal)}</div>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default React.memo(ProductCard);

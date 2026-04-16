import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonInput,
  IonSpinner,
} from "@ionic/react";

import { useEffect, useState } from "react";
import {
  getVariantsByProduct,
  createVariant,
  deleteVariant,
  ProductVariant,
  updateVariant,
} from "../../hooks/restAPIProductVariant";

import { formatRupiah, parseRupiah } from "../../utils/currency";

interface Props {
  productId: number;
}

const ProductVariantSection: React.FC<Props> = ({ productId }) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const fetchVariants = async () => {
    const data = await getVariantsByProduct(productId);
    setVariants(data);
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  /* ================= ADD ================= */
  const addVariant = async () => {
    try {
      await createVariant({
        product_id: productId,
        weight_grams: 0,
        price: 0,
      });

      await fetchVariants();
    } catch (err) {
      console.error("Create variant error:", err);
    }
  };

  /* ================= UPDATE ================= */
  const updateField = (
    id: number,
    field: keyof ProductVariant,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: Number(value) } : v)),
    );
  };

  const saveVariant = async (variant: ProductVariant) => {
    console.log("Saving variant:", variant);
    try {
      setLoadingId(variant.id);

      await updateVariant({
        id: variant.id,
        product_id: variant.product_id,
        weight_grams: variant.weight_grams,
        price: variant.price,
      });
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= DELETE ================= */
  const removeVariant = async (id: number) => {
    await deleteVariant(id);
    fetchVariants();
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Variant Produk</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <IonButton expand="block" onClick={addVariant}>
          + Tambah Variant
        </IonButton>

        <IonList>
          {variants.length === 0 ? (
            <IonItem>
              <IonLabel>Tidak ada variant</IonLabel>
            </IonItem>
          ) : (
            variants.map((v) => (
              <IonItem key={v.id}>
                <div style={{ width: "100%" }}>
                  <IonLabel>Berat (gram)</IonLabel>
                  <IonInput
                    type="number"
                    value={v.weight_grams}
                    onIonChange={(e) =>
                      updateField(v.id, "weight_grams", e.detail.value || "0")
                    }
                  />

                  <IonLabel>Harga</IonLabel>

                  <IonInput
                    type="text"
                    value={formatRupiah(v.price)}
                    onIonChange={(e) => {
                      const raw = parseRupiah(e.detail.value || "");
                      updateField(v.id, "price", String(raw));
                    }}
                  />

                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <IonButton
                      size="small"
                      onClick={() => saveVariant(v)}
                      disabled={loadingId === v.id}
                    >
                      {loadingId === v.id ? <IonSpinner /> : "Simpan"}
                    </IonButton>

                    <IonButton
                      size="small"
                      color="danger"
                      fill="outline"
                      onClick={() => removeVariant(v.id)}
                    >
                      Hapus
                    </IonButton>
                  </div>
                </div>
              </IonItem>
            ))
          )}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};

export default ProductVariantSection;

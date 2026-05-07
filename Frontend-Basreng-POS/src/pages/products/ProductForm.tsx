import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonChip,
} from "@ionic/react";

import { useEffect, useState, useRef } from "react";
import {
  createProduct,
  updateProduct,
  CreateProductPayload,
} from "../../hooks/restAPIProducts";

import { getCategories, Category } from "../../hooks/restAPICategories";
import ProductVariantSection from "../../components/productVariant/ProductVariantSection";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/* ================= SCHEMA ================= */

const productSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),

  category_id: z.coerce
    .number({
      required_error: "Kategori wajib dipilih",
      invalid_type_error: "Kategori tidak valid",
    })
    .nullable(),

  descriptions: z.array(z.string()).nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
  initialProduct?: any;
  initialCategory?: number | null;
}

const ProductForm: React.FC<Props> = ({
  isOpen,
  onDidDismiss,
  onSuccess,
  initialProduct,
  initialCategory,
}) => {
  const isEditMode = !!initialProduct?.id;

  const [productId, setProductId] = useState<number | null>(
    initialProduct?.id ?? null,
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category_id: initialCategory ?? undefined,
      descriptions: [],
    },
  });

  useEffect(() => {
    console.log("ERRORS:", formState.errors);
  }, [formState.errors]);

  const descriptions = watch("descriptions") || [];

  /* LOAD CATEGORY */
  useEffect(() => {
    if (!isOpen) return;
    getCategories().then(setCategories);
  }, [isOpen]);

  /* AUTO SELECT CATEGORY */
  useEffect(() => {
    if (!isOpen || isEditMode) return;

    reset({
      name: "",
      category_id: initialCategory ?? null,
      descriptions: [],
    });

    setProductId(null);
    setPreview(null);
    setImageFile(null);
  }, [isOpen, initialCategory, isEditMode, reset]);

  /* EDIT MODE */
  useEffect(() => {
    if (!initialProduct) return;

    reset({
      name: initialProduct.name,
      category_id: initialProduct.category_id,
      descriptions: initialProduct.descriptions
        ? initialProduct.descriptions.split(",").map((d: string) => d.trim())
        : [],
    });

    if (initialProduct.img) {
      setPreview(
        `http://localhost:8080/uploads/products/${initialProduct.img}`,
      );
    }

    setProductId(initialProduct.id);
  }, [initialProduct, reset]);

  /* SUBMIT */
  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      const payload: CreateProductPayload = {
        name: data.name,
        category_id: data.category_id,
        descriptions: data.descriptions?.join(",") ?? "",
        img: imageFile ?? undefined,
      };

      if (isEditMode && initialProduct) {
        await updateProduct({ ...payload, id: Number(initialProduct.id) });
        // setProductId(initialProduct.id);
      } else {
        const res = await createProduct(payload);
        // setProductId(res.product.id);
      }

      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditMode && initialCategory && categories.length > 0) {
      setValue("category_id", initialCategory);
    }
  }, [categories, initialCategory, isEditMode, setValue]);

  /* CHIP FUNCTIONS */
  const addDescription = () => {
    const current = getValues("descriptions") || [];
    setValue("descriptions", [...current, ""]);
  };

  const updateDescription = (index: number, value: string) => {
    const current = getValues("descriptions") || [];
    const updated = [...current];
    updated[index] = value;

    setValue("descriptions", updated, { shouldDirty: true });
  };

  const removeDescription = (index: number) => {
    const current = getValues("descriptions");
    const updated = current?.filter((_, i) => i !== index) || null;

    setValue("descriptions", updated);
  };

  console.log("initialCategory:", initialCategory);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onDidDismiss}>Tutup</IonButton>
          </IonButtons>
          <IonTitle>{isEditMode ? "Edit Produk" : "Tambah Produk"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Informasi Produk</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <form>
              {/* NAMA */}
              <IonItem>
                <IonLabel position="stacked">Nama</IonLabel>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <IonInput
                      value={field.value}
                      onIonChange={(e) => field.onChange(e.detail.value || "")}
                    />
                  )}
                />
              </IonItem>

              {/* IMAGE */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageFile(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />
              {preview && (
                <div onClick={() => fileRef.current?.click()}>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      borderRadius: "10px",
                      marginTop: "12px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <IonImg
                      src={preview}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* CATEGORY */}
              <IonItem>
                <IonLabel position="stacked">Kategori</IonLabel>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <IonSelect
                      value={field.value ? String(field.value) : undefined}
                      onIonChange={(e) =>
                        field.onChange(String(e.detail.value))
                      }
                    >
                      {categories.map((c) => (
                        <IonSelectOption key={c.id} value={c.id}>
                          {c.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  )}
                />
              </IonItem>

              {/* DESCRIPTIONS */}
              <IonItem lines="none">
                <IonLabel position="stacked">Deskripsi Produk</IonLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {descriptions.map((desc, index) => (
                    <IonChip key={index}>
                      <IonInput
                        value={desc}
                        onIonChange={(e) =>
                          updateDescription(index, e.detail.value || "")
                        }
                        placeholder="Isi deskripsi"
                      />
                      <IonButton
                        fill="clear"
                        size="small"
                        color="danger"
                        onClick={() => removeDescription(index)}
                      >
                        ✕
                      </IonButton>
                    </IonChip>
                  ))}

                  <IonChip
                    outline
                    color="primary"
                    onClick={addDescription}
                    style={{ cursor: "pointer" }}
                  >
                    + Tambah
                  </IonChip>
                </div>
              </IonItem>

              <IonButton
                expand="block"
                disabled={loading}
                onClick={handleSubmit(onSubmit)}
              >
                {loading ? <IonSpinner /> : "Simpan Produk"}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        {!productId && (
          <IonText color="medium">
            Simpan produk terlebih dahulu untuk menambah variant
          </IonText>
        )}

        {productId && <ProductVariantSection productId={productId} />}
      </IonContent>
    </IonModal>
  );
};

export default ProductForm;

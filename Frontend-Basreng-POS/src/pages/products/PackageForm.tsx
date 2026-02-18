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
  IonAlert,
} from "@ionic/react";
import { useEffect, useState } from "react";
import {
  createPackage,
  updatePackage,
  UpdatePackagePayload,
} from "../../hooks/restAPIPackage";
import { getCategories, Category } from "../../hooks/restAPICategories";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface PackageFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
  initialPackage?: any;
}

export interface AlertMessageProps {
  title: string;
  message: string;
}

const packageSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  price: z.string().min(1, "Harga harus diisi"),
});

type PackageFormData = z.infer<typeof packageSchema>;

const PackageForm: React.FC<PackageFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess,
  initialPackage,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: "",
    },
  });

  // Fetch kategori saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      resetForm();
      getCategories()
        .then((data) => setCategories(data))
        .catch((error) => console.error(error));
    }
  }, [isOpen]);

  // Isi default jika edit
  useEffect(() => {
    if (initialPackage) {
      reset({
        name: initialPackage.name,
        price: initialPackage.price,
      });
    } else {
      resetForm();
    }
  }, [initialPackage, reset]);

  const resetForm = () => {
    reset({
      name: "",
      price: "",
    });
  };

  const onSubmit = async (formData: PackageFormData) => {
    try {
      setLoading(true);

      const payload = {
        ...formData,
      };

      if (initialPackage) {
        const updatePayload: UpdatePackagePayload = {
          ...payload,
          id: initialPackage.id,
        };
        await updatePackage(updatePayload);
      } else {
        await createPackage(payload);
      }

      resetForm();
      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      setShowAlert(true);
      setAlertMessage({
        title: "Gagal Menyimpan",
        message: `${err}`,
      });
      console.error("Gagal menyimpan paket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onDidDismiss}>Kembali</IonButton>
          </IonButtons>
          <IonTitle>{initialPackage ? "Edit Paket" : "Tambah Paket"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonItem>
            <IonLabel position="stacked">Nama Paket</IonLabel>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <IonInput
                  {...field}
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value!)}
                />
              )}
            />
          </IonItem>
          {errors.name && (
            <p className="ion-text-error">{errors.name.message}</p>
          )}

          <IonItem>
            <IonLabel position="stacked">Harga</IonLabel>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <IonInput
                  type="number"
                  {...field}
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value!)}
                />
              )}
            />
          </IonItem>
          {errors.price && (
            <p className="ion-text-error">{errors.price.message}</p>
          )}

          <IonButton expand="block" type="submit" disabled={loading}>
            {loading ? (
              <IonSpinner name="dots" />
            ) : initialPackage ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Barang Baru"
            )}
          </IonButton>
        </form>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.title}
          message={alertMessage.message}
          buttons={[{ text: "OK", role: "cancel" }]}
        />
      </IonContent>
    </IonModal>
  );
};

export default PackageForm;

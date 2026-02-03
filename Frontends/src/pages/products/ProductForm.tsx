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
  IonAlert
} from '@ionic/react';
import { useEffect, useState } from 'react';
import {
  createProduct,
  updateProduct,
  ProductPayload,
  UpdateProductPayload
} from '../../hooks/restAPIProducts';
import { getCategories, Category } from '../../hooks/restAPICategories';
import { getSubCategoriesbyCategory } from '../../hooks/restAPISubCategories';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ProductFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
  initialProduct?: any;
}

export interface AlertMessageProps {
  title: string;
  message: string;
}

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  price: z.string().min(1, 'Harga harus diisi'),
  category_id: z.string().min(1, 'Kategori harus dipilih'),
  subcategory_id: z.string().nullable().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess,
  initialProduct
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({
    title: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      category_id: '',
      subcategory_id: null
    }
  });

  const watchCategory = watch('category_id');

  // Fetch subkategori jika category berubah
  useEffect(() => {
    if (watchCategory) {
      getSubCategoriesbyCategory(watchCategory)
        .then((data) => setSubcategories(data))
        .catch((error) => {
          console.error('Gagal Mengambil Sub Kategori', error);
          setSubcategories([]);
        });
    } else {
      setSubcategories([]);
    }
  }, [watchCategory]);

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
    if (initialProduct) {
      reset({
        name: initialProduct.name,
        price: initialProduct.price,
        category_id: initialProduct.category_id,
        subcategory_id: initialProduct.subcategory_id || null
      });
    } else {
      resetForm();
    }
  }, [initialProduct, reset]);

  const resetForm = () => {
    reset({
      name: '',
      price: '',
      category_id: '',
      subcategory_id: null
    });
  };

  const onSubmit = async (formData: ProductFormData) => {
    try {
      setLoading(true);

      const payload = {
        ...formData,
        subcategory_id: formData.subcategory_id ?? null
      };

      if (initialProduct) {
        const updatePayload: UpdateProductPayload = {
          ...payload,
          id: initialProduct.id
        };
        await updateProduct(updatePayload);
      } else {
        await createProduct(payload);
      }

      resetForm();
      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      setShowAlert(true);
      setAlertMessage({
        title: 'Gagal Menyimpan',
        message: `${err}`
      });
      console.error('Gagal menyimpan produk:', err);
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
          <IonTitle>{initialProduct ? 'Edit Produk' : 'Tambah Produk'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonItem>
            <IonLabel position="stacked">Nama Produk</IonLabel>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <IonInput {...field} value={field.value} onIonChange={e => field.onChange(e.detail.value!)} />
              )}
            />
          </IonItem>
          {errors.name && <p className="ion-text-error">{errors.name.message}</p>}

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
                  onIonChange={e => field.onChange(e.detail.value!)}
                />
              )}
            />
          </IonItem>
          {errors.price && <p className="ion-text-error">{errors.price.message}</p>}

          <IonItem>
            <IonLabel position="stacked">Kategori</IonLabel>
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <IonSelect
                  value={field.value}
                  placeholder="Pilih Kategori"
                  onIonChange={e => field.onChange(e.detail.value)}
                >
                  {categories.map((cat) => (
                    <IonSelectOption key={cat.id} value={cat.id}>
                      {cat.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              )}
            />
          </IonItem>
          {errors.category_id && <p className="ion-text-error">{errors.category_id.message}</p>}

          {(subcategories.length > 0) && (
            <IonItem>
              <IonLabel position="stacked">Sub Kategori</IonLabel>
              <Controller
                control={control}
                name="subcategory_id"
                render={({ field }) => (
                  <IonSelect
                    value={field.value || ''}
                    placeholder="Pilih Sub Kategori"
                    onIonChange={e => field.onChange(e.detail.value)}
                  >
                    {subcategories.map((subcat) => (
                      <IonSelectOption key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              />
            </IonItem>
          )}

          <IonButton expand="block" type="submit" disabled={loading}>
            {loading ? <IonSpinner name="dots" /> : initialProduct ? 'Simpan Perubahan' : 'Simpan Barang Baru'}
          </IonButton>
        </form>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.title}
          message={alertMessage.message}
          buttons={[{ text: 'OK', role: 'cancel' }]}
        />
      </IonContent>
    </IonModal>
  );
};

export default ProductForm;

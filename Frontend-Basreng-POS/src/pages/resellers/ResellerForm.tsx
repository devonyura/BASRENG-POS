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
  IonAlert,
  IonTextarea
} from '@ionic/react';
import { useEffect, useState } from 'react';
import {
  createReseller,
  updateReseller,
  ResellerPayload
} from '../../hooks/restAPIResellers';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertMessageProps } from '../products/ProductForm';

interface ResellerFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
  initialReseller?: any;
}

const resellerSchema = z.object({
  name: z.string().min(3, 'Nama reseller harus diisi'),
  phone: z.string().optional(),
  address: z.string().optional()
});

type ResellerFormData = z.infer<typeof resellerSchema>;

const ResellerForm: React.FC<ResellerFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess,
  initialReseller
}) => {
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
    formState: { errors }
  } = useForm<ResellerFormData>({
    resolver: zodResolver(resellerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: ''
    }
  });

  useEffect(() => {
    if (initialReseller) {
      reset({
        name: initialReseller.name ?? '',
        phone: initialReseller.phone ?? '',
        address: initialReseller.address ?? ''
      });
    } else {
      reset({
        name: '',
        phone: '',
        address: ''
      });
    }
  }, [initialReseller, reset]);

  const onSubmit = async (formData: ResellerFormData) => {
    try {
      setLoading(true);
      const payload: ResellerPayload = {
        name: formData.name,
        phone: formData.phone || null,
        address: formData.address || null
      };

      if (initialReseller) {
        await updateReseller(payload, initialReseller.id);
      } else {
        await createReseller(payload);
      }

      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      setShowAlert(true);
      setAlertMessage({
        title: 'Gagal Menyimpan',
        message: `${err}`
      });
      console.error('Gagal menyimpan reseller:', err);
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
          <IonTitle>{initialReseller ? 'Edit Reseller' : 'Tambah Reseller'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonItem>
            <IonLabel position="stacked">Nama Reseller</IonLabel>
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
            <IonLabel position="stacked">Nomor HP</IonLabel>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <IonInput {...field} value={field.value} onIonChange={e => field.onChange(e.detail.value!)} />
              )}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Alamat</IonLabel>
            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <IonTextarea {...field} value={field.value} onIonChange={e => field.onChange(e.detail.value!)} />
              )}
            />
          </IonItem>

          <IonButton expand="block" type="submit" disabled={loading}>
            {loading ? <IonSpinner name="dots" /> : initialReseller ? 'Simpan Perubahan' : 'Simpan Reseller Baru'}
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

export default ResellerForm;

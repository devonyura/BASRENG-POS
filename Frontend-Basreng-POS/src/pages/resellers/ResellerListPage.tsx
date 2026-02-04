import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonItem, IonLabel, IonList,
  IonButtons, IonBackButton, IonSpinner, IonAlert
} from '@ionic/react';
import { pencil, trashBin } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { getResellers, deleteReseller, Reseller } from '../../hooks/restAPIResellers';
import { AlertMessageProps } from '../products/ProductForm';
import ResellerForm from './ResellerForm';

const ResellerListPage: React.FC = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResellerForm, setShowResellerForm] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({ title: '', message: '' });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedResellerId, setSelectedResellerId] = useState('');

  useEffect(() => {
    fetchResellers();
  }, []);

  const fetchResellers = async () => {
    try {
      const data: Reseller[] = await getResellers();
      setResellers(data);
    } catch (err) {
      console.error("Gagal mengambil data reseller:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReseller(null);
    setShowResellerForm(true);
  };

  const handleEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setShowResellerForm(true);
  };

  const handleSuccess = () => {
    const info = editingReseller ? 'Diubah' : 'Ditambah';
    setShowResellerForm(false);
    setEditingReseller(null);
    fetchResellers();
    setAlertMessage({ title: 'Berhasil', message: `Reseller Berhasil ${info}!` });
    setShowAlert(true);
  };

  const confirmDelete = (resellerId: string | any) => {
    setSelectedResellerId(resellerId);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    try {
      await deleteReseller(selectedResellerId);
      setAlertMessage({ title: 'Berhasil', message: 'Reseller Berhasil Dihapus!' });
      fetchResellers();
    } catch (error) {
      console.error("Gagal menghapus reseller:", error);
      setAlertMessage({ title: 'Gagal', message: `Gagal menghapus reseller: ${error}` });
    } finally {
      setShowAlert(true);
      setShowConfirmDelete(false);
      setEditingReseller(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Data Reseller</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={handleAdd}>Tambah Reseller</IonButton>

        {loading ? (
          <IonSpinner name="crescent" className='ion-spin-list' />
        ) : (
          <IonList>
            {resellers.map(reseller => (
              <div key={reseller.id}>
                <IonItem color="light">
                  <IonLabel>
                    <h2>{reseller.name}</h2>
                    {reseller.phone && <p>HP: {reseller.phone}</p>}
                    {reseller.address && <p>Alamat: {reseller.address}</p>}
                  </IonLabel>
                  <IonButton fill="clear" slot="end" onClick={() => handleEdit(reseller)}>
                    <IonIcon icon={pencil} />
                  </IonButton>
                  <IonButton fill="clear" color="danger" slot="end" onClick={() => confirmDelete(reseller.id)}>
                    <IonIcon icon={trashBin} />
                  </IonButton>
                </IonItem>
              </div>
            ))}
          </IonList>
        )}

        <ResellerForm
          isOpen={showResellerForm}
          onDidDismiss={() => setShowResellerForm(false)}
          onSuccess={handleSuccess}
          initialReseller={editingReseller}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.title}
          message={alertMessage.message}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showConfirmDelete}
          header="Hapus Reseller?"
          message="Yakin menghapus reseller ini?"
          buttons={[
            {
              text: "Tidak",
              role: "cancel",
              handler: () => setShowConfirmDelete(false)
            },
            {
              text: "Ya",
              handler: executeDelete
            }
          ]}
          onDidDismiss={() => setShowConfirmDelete(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ResellerListPage;

import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonItem, IonLabel, IonList,
  IonButtons, IonBackButton, IonSpinner, IonAlert
} from '@ionic/react';
import { add, pencil, trashBin } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { getBranches, deleteBranch, Branch } from '../../hooks/restAPIBranch';
import { AlertMessageProps } from '../products/ProductForm';
import BranchAlertForm from './BranchAlertForm';

const BranchListPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({ title: '', message: '' });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data: Branch[] = await getBranches();
      setBranches(data);
    } catch (err) {
      console.error("Gagal mengambil data cabang:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBranch(null);
    setShowBranchForm(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setShowBranchForm(true);
  };

  const handleSuccess = () => {
    const info = editingBranch ? 'Diubah' : 'Ditambah';
    setShowBranchForm(false);
    setEditingBranch(null);
    fetchBranches();
    setAlertMessage({ title: 'Berhasil', message: `Cabang Berhasil ${info}!` });
    setShowAlert(true);
  };

  const confirmDelete = (branchId: string | any) => {
    setSelectedBranchId(branchId);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    try {
      await deleteBranch(selectedBranchId);
      setAlertMessage({ title: 'Berhasil', message: 'Cabang Berhasil Dihapus!' });
      fetchBranches();
    } catch (error) {
      console.error("Gagal menghapus cabang:", error);
      setAlertMessage({ title: 'Gagal', message: `Gagal menghapus cabang: ${error}` });
    } finally {
      setShowAlert(true);
      setShowConfirmDelete(false);
      setEditingBranch(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Data Cabang</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={handleAdd}>Tambah Cabang</IonButton>

        {loading ? (
          <IonSpinner name="crescent" className='ion-spin-list' />
        ) : (
          <IonList>
            {branches.map(branch => (
              <div key={branch.branch_id}>
                <IonItem color="light">
                  <IonLabel>
                    <h2>{branch.branch_name}</h2>
                  </IonLabel>
                  <IonButton fill="clear" slot="end" onClick={() => handleEdit(branch)}>
                    <IonIcon icon={pencil} />
                  </IonButton>
                  <IonButton fill="clear" color="danger" slot="end" onClick={() => confirmDelete(branch.branch_id)}>
                    <IonIcon icon={trashBin} />
                  </IonButton>
                </IonItem>
              </div>
            ))}
          </IonList>
        )}

        <BranchAlertForm
          isOpen={showBranchForm}
          onDidDismiss={() => setShowBranchForm(false)}
          onSuccess={handleSuccess}
          initialBranch={editingBranch}
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
          header={`Hapus Cabang?`}
          message={`Yakin menghapus cabang ini?`}
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

export default BranchListPage;

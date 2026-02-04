import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonAlert
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { getUsers, deleteUser, User } from '../../hooks/restAPIUsers';
import { trash, refresh } from 'ionicons/icons';
import UserAlertForm from './UserAlertForm';
import ResetPasswordForm from './ResetPasswordForm';

const UsersListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '' });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError('Gagal mengambil data pengguna');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      console.error('Gagal menghapus user:', err);
      setAlertMessage({
        title: 'Gagal Menghapus',
        message: `${err}`
      });
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daftar Pengguna</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={fetchUsers}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={() => setShowUserForm(true)}>
          Tambah User
        </IonButton>
        <IonButton expand="block" onClick={() => setShowResetPassword(true)}>
          Reset Password
        </IonButton>
        {loading ? (
          <IonSpinner name="dots" />
        ) : error ? (
          <p>{error}</p>
        ) : (
          <IonList>
            {users.map((user) => (
              <IonItem key={user.id}>
                <IonLabel>
                  <h2>{user.username}</h2>
                  <p>Role: {user.role}</p>
                </IonLabel>
                <IonButton
                  fill="clear"
                  color="danger"
                  slot="end"
                  onClick={() => handleDelete(user.id)}
                >
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.title}
          message={alertMessage.message}
          buttons={['OK']}
        />
        <UserAlertForm
          isOpen={showUserForm}
          onDidDismiss={() => setShowUserForm(false)}
          onSuccess={fetchUsers}
        />
        <ResetPasswordForm
          isOpen={showResetPassword}
          onDidDismiss={() => setShowResetPassword(false)}
          onSuccess={fetchUsers}
        />
      </IonContent>
    </IonPage>
  );
};

export default UsersListPage;

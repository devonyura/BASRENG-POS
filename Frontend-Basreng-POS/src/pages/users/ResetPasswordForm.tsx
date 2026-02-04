import {
  IonModal,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonText
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { resetUserPassword, ResetPasswordPayload } from '../../hooks/restAPIUsers';

interface ResetPasswordFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess
}) => {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset field ketika form dibuka
      setUsername('');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleResetPassword = async () => {
    const uname = username.trim();
    const oldPass = oldPassword.trim();
    const newPass = newPassword.trim();
    const confirmPass = confirmNewPassword.trim();

    if (!uname || !oldPass || !newPass || !confirmPass) {
      setErrorMessage('Semua kolom wajib diisi.');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorMessage('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    try {
      const payload: ResetPasswordPayload = {
        username: uname,
        old_password: oldPass,
        new_password: newPass
      };
      await resetUserPassword(payload);
      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      console.error('Gagal reset password:', err);
      setErrorMessage('Terjadi kesalahan saat mereset password.');
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <div style={{ padding: 16 }}>
        <h2>Reset Password</h2>

        <IonList>
          <IonItem>
            <IonLabel position="stacked">Username</IonLabel>
            <IonInput
              value={username}
              onIonInput={(e) => setUsername(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password Lama</IonLabel>
            <IonInput
              type="password"
              value={oldPassword}
              onIonInput={(e) => setOldPassword(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password Baru</IonLabel>
            <IonInput
              type="password"
              value={newPassword}
              onIonInput={(e) => setNewPassword(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Konfirmasi Password Baru</IonLabel>
            <IonInput
              type="password"
              value={confirmNewPassword}
              onIonInput={(e) => setConfirmNewPassword(e.detail.value!)}
            />
          </IonItem>
        </IonList>

        {errorMessage && (
          <IonText color="danger">
            <p>{errorMessage}</p>
          </IonText>
        )}

        <div style={{ marginTop: 16 }}>
          <IonButton onClick={handleResetPassword}>Simpan</IonButton>
          <IonButton color="medium" onClick={onDidDismiss}>Batal</IonButton>
        </div>
      </div>
    </IonModal>
  );
};

export default ResetPasswordForm;

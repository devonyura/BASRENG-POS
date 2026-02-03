import {
  IonModal,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonText
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { createUser, CreateUserPayload } from '../../hooks/restAPIUsers';

interface UserAlertFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
}

const UserAlertForm: React.FC<UserAlertFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess
}) => {
  const [step, setStep] = useState<'role' | 'form' | 'none'>('none');
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('role');
      setSelectedRole('admin');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleFormSave = async () => {
    const uname = username.trim();
    const pass = password.trim();
    const confirmPass = confirmPassword.trim();
    const role = selectedRole;

    if (!uname || !pass || !confirmPass || !role) {
      setErrorMessage('Semua kolom wajib diisi.');
      return;
    }

    if (pass !== confirmPass) {
      setErrorMessage('Password dan Konfirmasi Password tidak cocok.');
      return;
    }

    try {
      const payload: CreateUserPayload = {
        username: uname,
        password: pass,
        role
      };
      await createUser(payload);
      setStep('none');
      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      console.error('Gagal membuat user:', err);
      setErrorMessage('Terjadi kesalahan saat membuat user.');
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <div style={{ padding: 16 }}>
        {step === 'role' && (
          <>
            <h2>Pilih Role User</h2>
            <IonRadioGroup
              value={selectedRole}
              onIonChange={(e) => setSelectedRole(e.detail.value)}
            >
              <IonItem>
                <IonLabel>Admin</IonLabel>
                <IonRadio value="admin" />
              </IonItem>
              <IonItem>
                <IonLabel>Kasir</IonLabel>
                <IonRadio value="kasir" />
              </IonItem>
              <IonItem>
                <IonLabel>Owner</IonLabel>
                <IonRadio value="owner" />
              </IonItem>
              <IonItem>
                <IonLabel>Manager</IonLabel>
                <IonRadio value="manager" />
              </IonItem>
            </IonRadioGroup>

            <div style={{ marginTop: 16 }}>
              <IonButton onClick={() => setStep('form')}>Lanjut</IonButton>
              <IonButton color="medium" onClick={onDidDismiss}>Batal</IonButton>
            </div>
          </>
        )}

        {step === 'form' && (
          <>
            <h2>Tambah User</h2>

            <IonList>
              <IonItem>
                <IonLabel position="stacked">Username</IonLabel>
                <IonInput
                  value={username}
                  onIonInput={(e) => setUsername(e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Konfirmasi Password</IonLabel>
                <IonInput
                  type="password"
                  value={confirmPassword}
                  onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                />
              </IonItem>
            </IonList>

            {errorMessage && (
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            )}

            <div style={{ marginTop: 16 }}>
              <IonButton onClick={handleFormSave}>Simpan</IonButton>
              <IonButton color="medium" onClick={onDidDismiss}>Batal</IonButton>
            </div>
          </>
        )}
      </div>
    </IonModal>
  );
};

export default UserAlertForm;

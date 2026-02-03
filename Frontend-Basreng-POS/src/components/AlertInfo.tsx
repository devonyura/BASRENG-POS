
import { IonAlert, IonicSafeString } from '@ionic/react';

export interface AlertState {
  showAlert: boolean;
  header: string | undefined;
  alertMesage: string | IonicSafeString | undefined;
  hideButton?: boolean;
}

interface AlertOkProps {
  isOpen: boolean;
  onDidDismiss: () => (void) | null;
  header?: string | undefined;
  message: string | IonicSafeString | undefined;
  hideButton?: boolean;
}

const AlertInfo: React.FC<AlertOkProps> = ({ isOpen, onDidDismiss, header = "Notifikasi", message, hideButton = false }) => {
  let button = ['OK'];
  (hideButton) ? button = [] : button = ['OK']
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={() => onDidDismiss()}
      header={header}
      message={message}
      buttons={button}
    />
  );
}

export default AlertInfo;
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonMenu,
  IonMenuToggle
} from '@ionic/react';
import { exitOutline, pricetagsOutline, build, people, personCircleOutline } from 'ionicons/icons';

interface DashboardMenuProps {
  onLogout: () => void;
}

const DashboardMenu: React.FC<DashboardMenuProps> = ({ onLogout }) => (
  <IonMenu contentId="main-content">
    <IonHeader>
      <IonToolbar>
        <IonTitle>Admin Menu</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <IonMenuToggle>
        <IonButton routerLink="/product-list" expand="block">
          <IonIcon icon={pricetagsOutline} slot="start" />
          Data Barang
        </IonButton>
      </IonMenuToggle>
      <IonMenuToggle>
        <IonButton routerLink="/categories" expand="block">
          <IonIcon icon={pricetagsOutline} slot="start" />
          Kategori
        </IonButton>
      </IonMenuToggle>
      <IonMenuToggle>
        <IonButton routerLink="/branch" expand="block">
          <IonIcon icon={build} slot="start" />
          Cabang
        </IonButton>
      </IonMenuToggle>
      <IonMenuToggle>
        <IonButton routerLink="/users" expand="block">
          <IonIcon icon={people} slot="start" />
          Management Akun
        </IonButton>
      </IonMenuToggle>
      <IonMenuToggle>
        <IonButton routerLink="/resellers" expand="block">
          <IonIcon icon={personCircleOutline} slot="start" />
          Data Reseller
        </IonButton>
      </IonMenuToggle>
      <IonMenuToggle>
        <IonButton routerLink="/report" expand="block">
          <IonIcon icon={people} slot="start" />
          Laporan
        </IonButton>
      </IonMenuToggle>
      <IonButton onClick={onLogout} expand='block'>
        <IonIcon icon={exitOutline} slot='start' />
        Keluar
      </IonButton>
    </IonContent>
  </IonMenu>
);

export default DashboardMenu;

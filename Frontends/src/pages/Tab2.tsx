import { useEffect } from 'react'
import { camera } from 'ionicons/icons'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonProgressBar,
  IonText,
} from '@ionic/react';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import './Tab2.css';
import { useHistory } from "react-router-dom";
import { useAuth } from "../hooks/useAuthCookie";

const Tab2: React.FC = () => {

  const { token } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!token) {
      history.replace("/login", { isTokenExpired: true });
    }
  }, [token, history]);

  if (!token) {
    return (
      <>
        <IonProgressBar type="indeterminate"></IonProgressBar>
        <IonText color="secondary">
          <h2>Memuat Data...</h2>
        </IonText>
      </>
    )
  }


  const { takePhoto, photos } = usePhotoGallery()
  console.log(photos);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gallery Picture</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Photo Gallery</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size='6' key={photo.filepath}>
                <IonImg src={photo.webviewPath} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonFab vertical='bottom' horizontal='center' slot='fixed'>
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;

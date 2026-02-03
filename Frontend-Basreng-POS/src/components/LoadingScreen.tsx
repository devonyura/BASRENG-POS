import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonSpinner } from "@ionic/react";
import "./LoadingScreen.css";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  showDelaySubMessage?: number;
  fullscreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Tunggu Sebentar...",
  subMessage = "Periksa Jaringan Anda Jika Lama Memuat.",
  showDelaySubMessage = 5000,
  fullscreen = true
}) => {

  const [showSubText, setShowSubText] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => { setShowSubText(true) }, showDelaySubMessage);
    return () => clearTimeout(timeout)
  }, [showDelaySubMessage])

  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center" fullscreen={fullscreen}>
        <div className="loading">
          <IonSpinner name="crescent" />
          <h2>{message}</h2>
          {showSubText && (
            <p>{subMessage}</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default LoadingScreen
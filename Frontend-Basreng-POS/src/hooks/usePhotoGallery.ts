import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

const PHOTO_STORAGE = 'photos';
export function usePhotoGallery() {

  const [photos, setPhotos] =useState<UserPhoto[]>([]); 

  defineCustomElements(window);
  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
      });

      const fileName = Date.now() + ".jpeg";
      const savedFileImage = await savePicture(photo, fileName);

      setPhotos([savedFileImage, ...photos]);

      const newPhotos = [savedFileImage, ...photos];

      Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) })
    } catch (error: any) {
        // Tangani jika pengguna membatalkan kamera
      if (error.message !== 'User cancelled photos app') {
        console.warn('Camera error:', error);
      }
    }
  };

  useEffect(()=>{
    const loadSaved = async () => {
      const { value } = await Preferences.get({key: PHOTO_STORAGE});
      const photosInPreferences = ( value ? JSON.parse(value) : []) as UserPhoto[];

      for (let photo of photosInPreferences) {
        const file = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });
        // web only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      }
      setPhotos(photosInPreferences);
    };
    loadSaved();
  }, []);

  const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
    const base64Data = await base64FromPath(photo.webPath!);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    }
  } 

  
  return {
    takePhoto,
    photos,
  };
}

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject)=>{
    const render = new FileReader();
    render.onerror = reject;
    render.onload = () => {
      if (typeof render.result === "string") {
        resolve(render.result);
      } else {
        reject('method did not return a string');
      }
    }
    render.readAsDataURL(blob);
  });
} 

export interface UserPhoto {
    filepath: string;
    webviewPath?: string;
}
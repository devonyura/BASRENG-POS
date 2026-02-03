import { IonAlert } from '@ionic/react';
import { useState } from 'react';
import {
  createSubCategory,
  updateSubCategory,
  SubCategoriesPayload
} from '../../hooks/restAPISubCategories';

interface SubCategoryAlertFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
  parentCategoryId: string | null; // ID dari kategori induk
  initialSubCategory?: {
    id: string | null;
    name: string | null;
  } | null;
}

const SubCategoryAlertForm: React.FC<SubCategoryAlertFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess,
  parentCategoryId,
  initialSubCategory
}) => {
  const [showError, setShowError] = useState(false);

  const handleSave = async (nameInputFromAlert: string) => {
    const nameInput = (nameInputFromAlert || '').trim();
    if (!nameInput) {
      setShowError(true);
      return false;
    }

    try {
      const payload: SubCategoriesPayload = {
        name: nameInput,
        id_categories: parentCategoryId // relasi ke kategori induk
      };

      if (initialSubCategory?.id) {
        await updateSubCategory(payload, initialSubCategory.id);
      } else {
        await createSubCategory(payload);
      }

      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      console.error('Gagal menyimpan sub-kategori:', err);
      alert('Terjadi kesalahan saat menyimpan sub-kategori.');
    }

    return true;
  };

  return (
    <>
      <IonAlert
        isOpen={isOpen}
        onDidDismiss={onDidDismiss}
        header={initialSubCategory ? 'Edit Sub-Kategori' : 'Tambah Sub-Kategori'}
        inputs={[
          {
            name: 'name',
            type: 'text',
            placeholder: 'Nama Sub-Kategori',
            value: initialSubCategory?.name || ''
          }
        ]}
        buttons={[
          {
            text: 'Batal',
            role: 'cancel',
            handler: onDidDismiss
          },
          {
            text: 'Simpan',
            handler: async (data) => {
              return await handleSave(data.name);
            }
          }
        ]}
      />

      <IonAlert
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        header="Validasi Gagal"
        message="Nama sub-kategori tidak boleh kosong."
        buttons={['OK']}
      />
    </>
  );
};

export default SubCategoryAlertForm;

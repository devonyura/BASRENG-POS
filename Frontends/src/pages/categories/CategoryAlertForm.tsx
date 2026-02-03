import { IonAlert } from '@ionic/react';
import { useEffect, useState } from 'react';
import { CategoriesPayload, createCategories, updateCategories } from '../../hooks/restAPICategories';

interface CategoryAlertFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
  initialCategory?: {
    id: string | null;
    name: string | null;
  } | null;
}

const CategoryAlertForm: React.FC<CategoryAlertFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess,
  initialCategory
}) => {
  // const [name, setName] = useState<null | string>('');
  const [showError, setShowError] = useState(false);

  // useEffect(() => {
  //   if (initialCategory) {
  //     setName(initialCategory.name);
  //   } else {
  //     setName('');
  //   }
  // }, [initialCategory, isOpen]);

  const handleSave = async (nameInputFromAlert: string) => {

    const nameInput = (nameInputFromAlert || '').trim();
    if (!nameInput) {
      setShowError(true);
      return false;
    }

    try {
      const payload: CategoriesPayload = { name: nameInput };

      if (initialCategory) {
        await updateCategories(payload, initialCategory.id);
      } else {
        await createCategories(payload);
      }
      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      console.error('Gagal menyimpan kategori:', err);
      alert('Terjadi kesalahan saat menyimpan kategori.');
    }
    return true;

  };

  return (
    <>
      <IonAlert
        isOpen={isOpen}
        onDidDismiss={onDidDismiss}
        header={initialCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        inputs={[
          {
            name: 'name',
            type: 'text',
            placeholder: 'Nama Kategori',
            value: initialCategory?.name
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
              return await handleSave(data.name)
            }
          }
        ]}
      />


      <IonAlert
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        header="Validasi Gagal"
        message="Nama kategori tidak boleh kosong."
        buttons={['OK']}
      />
    </>
  );
};

export default CategoryAlertForm;

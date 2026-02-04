import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonItem, IonLabel, IonList,
  IonButtons, IonBackButton, IonSpinner, IonAlert
} from '@ionic/react';
import { add, pencil, trashBin } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { getCategories, deleteCategory, Category } from '../../hooks/restAPICategories';
import { deleteSubCategory, getSubCategoriesbyCategory, SubCategory } from '../../hooks/restAPISubCategories';
// import CategoryForm from './CategoryForm'; // Kita buat setelah ini 
import { AlertMessageProps } from '../products/ProductForm';
import CategoryAlertForm from './CategoryAlertForm';
import SubCategoryAlertForm from "./SubCategoryAlertForm";

const CategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State baru:
  const [subCategories, setSubCategories] = useState<{ [key: string]: SubCategory[] }>({});
  const [loadingSub, setLoadingSub] = useState<{ [key: string]: boolean }>({});
  const [deleteType, setDeleteType] = useState<'category' | 'subCategory' | null>(null);

  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({ title: '', message: '' });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data: Category[] = await getCategories();
      setCategories(data);

      // Ambil data semua sub-category
      data.forEach(cat => fetchSubCategories(cat.id))
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    try {
      setLoadingSub(prev => ({ ...prev, [categoryId]: true }));
      const data = await getSubCategoriesbyCategory(categoryId);

      // Pastikan data array
      if (Array.isArray(data)) {
        setSubCategories(prev => ({ ...prev, [categoryId]: data }));
      } else {
        setSubCategories(prev => ({ ...prev, [categoryId]: [] }));
      }
    } catch (err) {
      console.error("Gagal mengambil sub-kategori:", err);
      setSubCategories(prev => ({ ...prev, [categoryId]: [] }));
    } finally {
      setLoadingSub(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleAdd = () => {
    console.log('Tambah kategori');

    setEditingCategory(null);
    setShowCategoryForm(true);
    // show form/modal di langkah selanjutnya
  };

  const handleEdit = (category: Category) => {
    console.log('Edit kategori:', category);
    setEditingCategory(category);
    setShowCategoryForm(true);
    // show form/modal di langkah selanjutnya
  };

  const handleSuccess = () => {
    const info = editingCategory ? 'Diubah' : 'Ditambah';
    setShowCategoryForm(false);
    setEditingCategory(null);
    fetchCategories();
    setAlertMessage({ title: 'Berhasil', message: `Kategori Berhasil ${info}!` });
    setShowAlert(true);
  };

  const confirmDelete = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDeleteType('category')
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    try {
      await deleteCategory(selectedCategoryId);
      setAlertMessage({ title: 'Berhasil', message: 'Kategori Berhasil Dihapus!' });
      fetchCategories();
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
      setAlertMessage({ title: 'Gagal', message: `Gagal menghapus kategori: ${error}` });
    } finally {
      setShowAlert(true);
      setShowConfirmDelete(false);
    }
    setEditingCategory(null);
  };

  const handleAddSub = (categoryId: string) => {
    console.log('Tambah sub kategori untuk:', categoryId);
    setParentCategoryId(categoryId)
    setEditingSubCategory(null)
    setShowSubCategoryForm(true)
  };

  const handleEditSub = (sub: SubCategory, categoryId: string) => {
    console.log('Edit sub kategori:', sub, 'dari kategori:', categoryId);
    setParentCategoryId(categoryId)
    setEditingSubCategory(sub)
    setShowSubCategoryForm(true)
  };

  const confirmSubDelete = (subCategoryId: string, categoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
    setParentCategoryId(categoryId)
    setDeleteType('subCategory')
    setShowConfirmDelete(true);
  };

  const executeSubDelete = async () => {
    try {
      await deleteSubCategory(selectedSubCategoryId);
      setAlertMessage({ title: 'Berhasil', message: 'Sub Kategori Berhasil Dihapus!' });
      setShowConfirmDelete(false)
      if (parentCategoryId) {
        await fetchSubCategories(parentCategoryId)
      }
    } catch (error) {
      console.error("Gagal menghapus Sub kategori:", error);
      setAlertMessage({ title: 'Gagal', message: `Gagal menghapus Sub kategori: ${error}` });
    } finally {
      setShowAlert(true);
      setShowConfirmDelete(false);
    }
    setEditingSubCategory(null);
  };

  const handleSubSuccess = async () => {
    const info = editingSubCategory ? 'Diubah' : 'Ditambah';
    if (parentCategoryId) {
      await fetchSubCategories(parentCategoryId)
    }
    setShowSubCategoryForm(false)
    setEditingSubCategory(null)
    setParentCategoryId(null)
    setAlertMessage({ title: 'Berhasil', message: `Sub Kategori Berhasil ${info}!` });
    setShowAlert(true);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Data Kategori</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={handleAdd}>Tambah Kategori</IonButton>

        {loading ? (
          <IonSpinner name="crescent" className='ion-spin-list' />
        ) : (
          <IonList>
            {categories.map(category => (
              <div key={category.id}>
                <IonItem color="light">
                  <IonLabel>
                    <h2>{category.name}</h2>
                  </IonLabel>
                  <IonButton fill="clear" slot="end" onClick={() => handleEdit(category)}>
                    <IonIcon icon={pencil} />
                  </IonButton>
                  <IonButton fill="clear" color="danger" slot="end" onClick={() => confirmDelete(category.id)}>
                    <IonIcon icon={trashBin} />
                  </IonButton>
                </IonItem>

                {/* Subcategories */}
                {loadingSub[category.id] ? (
                  <IonItem>
                    <IonSpinner name="dots" />
                  </IonItem>
                ) : (
                  <>
                    {Array.isArray(subCategories[category.id]) && subCategories[category.id].length > 0 ? (
                      subCategories[category.id].map(sub => (
                        <IonItem key={sub.id} lines="none" className="ion-padding-start">
                          <IonLabel>{sub.name}</IonLabel>
                          <IonButton fill="clear" slot="end" onClick={() => handleEditSub(sub, category.id)}>
                            <IonIcon icon={pencil} />
                          </IonButton>
                          <IonButton fill="clear" color="danger" slot="end" onClick={() => confirmSubDelete(sub.id, category.id)}>
                            <IonIcon icon={trashBin} />
                          </IonButton>
                        </IonItem>
                      ))
                    ) : (
                      <IonItem lines="none" className="ion-padding-start">
                        <IonLabel><i>Tidak ada sub-kategori</i></IonLabel>
                      </IonItem>
                    )}
                  </>
                )}

                {/* Tombol Tambah Subkategori */}
                <IonItem lines="none" className="ion-padding-start">
                  <IonButton expand="block" fill="outline" onClick={() => handleAddSub(category.id)}>
                    <IonIcon icon={add} slot="start" />
                    Tambah Sub Kategori
                  </IonButton>
                </IonItem>
              </div>
            ))}
          </IonList>
        )}

        <CategoryAlertForm
          isOpen={showCategoryForm}
          onDidDismiss={() => setShowCategoryForm(false)}
          onSuccess={() => {
            handleSuccess()
          }}
          initialCategory={editingCategory}
        />

        <SubCategoryAlertForm
          isOpen={showSubCategoryForm}
          onDidDismiss={() => setShowSubCategoryForm(false)}
          onSuccess={() => {
            handleSubSuccess()
          }}
          initialSubCategory={editingSubCategory}
          parentCategoryId={parentCategoryId}
        />


        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.title}
          message={alertMessage.message}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showConfirmDelete}
          header={`Hapus ${deleteType === 'category' ? 'Kategori' : 'Sub Kategori'}?`}
          message={`Yakin Menghapus ${deleteType === 'category' ? 'Kategori' : 'Sub Kategori'}?`}
          buttons={[
            {
              text: "Tidak",
              role: "cancel",
              handler: () => setShowConfirmDelete(false)
            },
            {
              text: "Ya",
              handler: deleteType === 'category' ? executeDelete : executeSubDelete
            }
          ]}
          onDidDismiss={() => setShowConfirmDelete(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default CategoryListPage;

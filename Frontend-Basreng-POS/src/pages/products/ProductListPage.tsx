// ProductListPage.tsx
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonItem, IonLabel, IonList,
  IonButtons, IonBackButton, IonSpinner, IonAlert,
  IonAccordion, IonAccordionGroup
} from '@ionic/react';
import { pencil, trashBin } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { getProducts, Product, deleteProduct } from '../../hooks/restAPIProducts';
import { getCategories, Category } from '../../hooks/restAPICategories';
import { formatProductName } from '../../hooks/formatting';
import ProductForm, { AlertMessageProps } from './ProductForm';
import './ProductListPage.css';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({ title: '', message: '' });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Gagal mengambil data produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
    }
  };

  const handleAdd = (categoryId?: string) => {
    setEditingProduct(null);
    setSelectedCategoryId(categoryId);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    const sanitizedProduct = {
      ...product,
      price: product.price.toString().split('.')[0],
      quantity: product.quantity !== undefined && product.quantity !== null
        ? product.quantity.toString().split('.')[0]
        : ''
    };
    setEditingProduct(sanitizedProduct);
    setShowModal(true);
  };

  const handleSuccess = () => {
    const info = editingProduct ? 'Diubah' : 'Ditambah';
    setShowModal(false);
    setEditingProduct(null);
    setSelectedCategoryId(undefined);
    fetchProducts();
    setAlertMessage({ title: 'Berhasil', message: `Produk Berhasil ${info}!` });
    setShowAlert(true);
  };

  const confirmDelete = (productId: string) => {
    setSelectedProductId(productId);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    try {
      await deleteProduct(selectedProductId);
      setAlertMessage({ title: 'Berhasil', message: 'Produk Berhasil Dihapus!' });
      fetchProducts();
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      setAlertMessage({ title: 'Gagal', message: `Gagal menghapus produk: ${error}` });
    } finally {
      setShowAlert(true);
      setShowConfirmDelete(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Data Barang</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner name="crescent" className='ion-spin-list' />
        ) : (
          <IonAccordionGroup>
            {categories.map(category => {
              const categoryProducts = products.filter((product) => product.category_id === category.id);
              return (
                <IonAccordion key={category.id} value={category.id}>
                  <IonItem slot="header">
                    <IonLabel>{category.name}</IonLabel>
                  </IonItem>
                  <div className="ion-padding" slot="content">
                    <IonButton expand="block" onClick={() => handleAdd(category.id)}>
                      Tambah Barang
                    </IonButton>
                    <IonList>
                      {categoryProducts.map(product => (
                        <IonItem key={product.id}>
                          <IonLabel>
                            <h2>{formatProductName(product.name, product.quantity)}</h2>
                            <p>Harga: Rp {parseInt(product.price).toLocaleString()}</p>
                          </IonLabel>
                          <IonButton fill="clear" slot="end" onClick={() => handleEdit(product)}>
                            <IonIcon icon={pencil} />
                          </IonButton>
                          <IonButton fill="clear" color="danger" slot="end" onClick={() => confirmDelete(product.id)}>
                            <IonIcon icon={trashBin} />
                          </IonButton>
                        </IonItem>
                      ))}
                    </IonList>
                  </div>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        )}

        <ProductForm
          isOpen={showModal}
          initialProduct={editingProduct}
          initialCategoryId={selectedCategoryId}
          onSuccess={handleSuccess}
          onDidDismiss={() => {
            setShowModal(false);
            setEditingProduct(null);
            setSelectedCategoryId(undefined);
          }}
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
          header="Hapus Produk?"
          message="Yakin ingin menghapus produk?"
          buttons={[
            {
              text: "Tidak",
              role: "cancel",
              handler: () => setShowConfirmDelete(false)
            },
            {
              text: "Ya",
              handler: executeDelete
            }
          ]}
          onDidDismiss={() => setShowConfirmDelete(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;

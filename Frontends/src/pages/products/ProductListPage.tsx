// ProductListPage.tsx
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonItem, IonLabel, IonList,
  IonButtons, IonBackButton, IonSpinner, IonAlert
} from '@ionic/react';
import { pencil, trashBin } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { getProducts, Product, deleteProduct } from '../../hooks/restAPIProducts';
import ProductForm, { AlertMessageProps } from './ProductForm';
import './ProductListPage.css';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({ title: '', message: '' });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    fetchProducts();
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

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    const sanitizedProduct = { ...product, price: product.price.toString().split('.')[0] };
    setEditingProduct(sanitizedProduct);
    setShowModal(true);
  };

  const handleSuccess = () => {
    const info = editingProduct ? 'Diubah' : 'Ditambah';
    setShowModal(false);
    setEditingProduct(null);
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
        <IonButton expand="block" onClick={handleAdd}>Tambah Barang</IonButton>

        {loading ? (
          <IonSpinner name="crescent" className='ion-spin-list' />
        ) : (
          <IonList>
            {products.map(product => (
              <IonItem key={product.id}>
                <IonLabel>
                  <h2>{product.name}</h2>
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
        )}

        <ProductForm
          isOpen={showModal}
          initialProduct={editingProduct}
          onSuccess={handleSuccess}
          onDidDismiss={() => {
            setShowModal(false);
            setEditingProduct(null);
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

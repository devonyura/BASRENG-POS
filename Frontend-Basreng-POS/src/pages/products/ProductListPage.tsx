// ProductListPage.tsx
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonAlert,
  IonAccordion,
  IonAccordionGroup,
  IonText,
  IonImg,
} from "@ionic/react";
import { pencil, trashBin } from "ionicons/icons";
import { useEffect, useState } from "react";
import {
  getProducts,
  Product,
  deleteProduct,
} from "../../hooks/restAPIProducts";
import { getCategories, Category } from "../../hooks/restAPICategories";
import ProductForm from "./ProductForm";
import "./ProductListPage.css";
import { FILE_BASE_URL } from "../../hooks/restAPIRequest";
import { AlertMessageProps } from "./PackageForm";
import { formatWeight } from "../../hooks/formatting";

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | number | null
  >(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({
    title: "",
    message: "",
  });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      console.log("Products:", data);
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

  // const handleAdd = (categoryId?: string) => {
  //   setEditingProduct(null);
  //   setSelectedCategoryId(categoryId);
  //   setShowModal(true);
  // };

  const handleEdit = (product: Product) => {
    // setEditingProduct(product);
    setShowModal(true);
  };

  const handleSuccess = () => {
    // const info = editingProduct ? "Diubah" : "Ditambah";
    setShowModal(false);
    setSelectedCategoryId(null);
    fetchInitialData();
    setAlertMessage({ title: "Berhasil", message: `Proses Berhasil!` });
    setShowAlert(true);
  };

  const confirmDelete = (productId: string) => {
    setSelectedProductId(productId);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    try {
      await deleteProduct(selectedProductId);
      setAlertMessage({
        title: "Berhasil",
        message: "Produk Berhasil Dihapus!",
      });
      fetchProducts();
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      setAlertMessage({
        title: "Gagal",
        message: `Gagal menghapus produk: ${error}`,
      });
    } finally {
      setShowAlert(true);
      setShowConfirmDelete(false);
    }
  };

  // ========= BAGIAN FORM/TOMBOL EDIT/TAMBAH
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

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
          <IonSpinner name="crescent" className="ion-spin-list" />
        ) : (
          <IonAccordionGroup>
            {categories.map((category) => {
              const categoryProducts = products
                .filter((product) => product.category_id === category.id)
                .sort((a, b) => a.name.localeCompare(b.name));
              return (
                <IonAccordion key={category.id} value={String(category.id)}>
                  <IonItem slot="header">
                    <IonLabel>{category.name}</IonLabel>
                  </IonItem>
                  <div className="ion-padding" slot="content">
                    <IonList>
                      {categoryProducts.map((product) => (
                        <IonItem key={product.id} className="product-item">
                          <div className="product-image">
                            <IonImg
                              src={
                                product.img
                                  ? `${FILE_BASE_URL}/${product.img}`
                                  : "/assets/no-image.png"
                              }
                            />
                          </div>
                          <IonLabel>
                            <h2>{product.name}</h2>

                            {product.variants.length === 0 ? (
                              <IonText color="medium">Tidak ada varian</IonText>
                            ) : (
                              product.variants.map((variant) => (
                                <p key={variant.variant_id}>
                                  {formatWeight(variant.weight_grams)} — Rp{" "}
                                  {parseInt(variant.price).toLocaleString()}
                                </p>
                              ))
                            )}
                          </IonLabel>

                          <IonButton
                            fill="clear"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowForm(true);
                            }}
                          >
                            <IonIcon icon={pencil} />
                          </IonButton>
                          <IonButton
                            fill="clear"
                            color="danger"
                            slot="end"
                            onClick={() => confirmDelete(product.id)}
                          >
                            <IonIcon icon={trashBin} />
                          </IonButton>
                        </IonItem>
                      ))}
                    </IonList>
                    <IonButton
                      expand="block"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSelectedCategoryId(category.id);
                        setShowForm(true);
                      }}
                    >
                      Tambah {category.name}
                    </IonButton>
                  </div>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        )}

        <ProductForm
          isOpen={showForm}
          initialProduct={selectedProduct}
          initialCategory={Number(selectedCategoryId)}
          onDidDismiss={() => {
            setShowForm(false);
            fetchInitialData();
          }}
          onSuccess={handleSuccess}
        />
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.title}
          message={alertMessage.message}
          buttons={["OK"]}
        />

        <IonAlert
          isOpen={showConfirmDelete}
          header="Hapus Produk?"
          message="Yakin ingin menghapus produk?"
          buttons={[
            {
              text: "Tidak",
              role: "cancel",
              handler: () => setShowConfirmDelete(false),
            },
            {
              text: "Ya",
              handler: executeDelete,
            },
          ]}
          onDidDismiss={() => setShowConfirmDelete(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;

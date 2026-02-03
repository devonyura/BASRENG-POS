import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonIcon,
  IonLabel,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  useIonViewWillEnter,
  IonAccordion, IonAccordionGroup, IonItem,
  IonAlert, IonSpinner
} from '@ionic/react';

// State, History etc
import { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// hooks
import { useAuth } from "../../hooks/useAuthCookie";

// components
import DetailOrder from "./DetailOrder";
import ProductCard from "../../components/ProductCard";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/productSlice";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchSubCategories } from "../../redux/subCategorySlice";
import { RootState, AppDispatch } from "../../redux/store"

// Loading Component
import LoadingScreen from "../../components/LoadingScreen";

// styling
import "./KasirPage.css";

const KasirPage: React.FC = () => {

  // ===== Setup Auth
  const { token, role } = useAuth();
  const history = useHistory();


  // Redirect if token expired/wrong
  useEffect(() => {
    if (token === null && role === null) {
      history.replace("/login", { isTokenExpired: true });
    }
  }, [token, role, history]);

  // get Redux State
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading, error: productError } = useSelector((state: RootState) => state.products)
  const { categories, error: categoryError } = useSelector((state: RootState) => state.categories)
  const { subCategories, error: subCategoryError } = useSelector((state: RootState) => state.subCategories)

  // Jalankan fetchProducts saat pertama kali komponen dimuat
  useIonViewWillEnter(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
    dispatch(fetchSubCategories())
  }, [dispatch])

  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (productError || categoryError || subCategoryError) {
      setIsNoInternetOpen(true)
    }

    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory('1');
    }
    console.log(isAppLoading)

  }, [productError, categoryError, selectedCategory])

  // No Internet Connection Alert 
  const [isNoInternetOpen, setIsNoInternetOpen] = useState(false)

  // cek kategori
  const filteredSubCategories = subCategories.filter(
    (sub) => sub.id_categories === selectedCategory
  );

  const hasSubCategories = filteredSubCategories.length > 0;

  // === Loading section
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    if (
      products.length > 0 &&
      categories.length > 0 &&
      subCategories.length > 0
    ) {
      setIsAppLoading(false);
    }
  }, [products, categories, subCategories]);

  if (isAppLoading) {
    return <LoadingScreen />
  }
  // === Loading section

  return (
    <IonPage>
      <IonAlert
        isOpen={isNoInternetOpen}
        header='Peringatan'
        message="Tidak dapat terhubung ke server. Periksa koneksi Anda."
        buttons={[
          {
            text: 'Coba Lagi',
            role: 'confirm',
            handler: () => {
              setIsNoInternetOpen(false)
              dispatch(fetchProducts())
            }
          }
        ]}
        onDidDismiss={() => setIsNoInternetOpen(false)}
        backdropDismiss={false}
      ></IonAlert>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Kasir Panel
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>
          Pilih Item yang akan dibeli:
        </h2>

        <IonSegment value={selectedCategory} onIonChange={(e) => setSelectedCategory(String(e.detail.value!))}>
          {categories.map((cat) => (
            <IonSegmentButton key={cat.id} value={cat.id}>
              <IonLabel>{cat.name}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>

        {hasSubCategories ? (
          <div className="">
            <IonAccordionGroup>
              {
                subCategories
                  .filter((sub) => sub.id_categories === selectedCategory)
                  .map((sub) => (
                    <IonAccordion key={sub.id} value={sub.id}>
                      <IonItem slot='header'>
                        <IonLabel>{sub.name}</IonLabel>
                      </IonItem>
                      <div className="ion-padding" slot='content'>
                        {products
                          .filter((product) => (
                            product.category_id === selectedCategory &&
                            product.name.toLowerCase().includes(sub.name.toLowerCase())
                          ))
                          .map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))
                        }
                      </div>
                    </IonAccordion>
                  ))
              }
            </IonAccordionGroup>
          </div>
        ) : (
          <div className="ion-padding">
            {products
              .filter((product) => product.category_id === selectedCategory)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        )}

        {/* Detail Order Component */}
        <DetailOrder />
      </IonContent>
    </IonPage>
  )
};

export default KasirPage;

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
} from "@ionic/react";
import { pencil, trashBin } from "ionicons/icons";
import { useEffect, useState } from "react";
import {
  getPackages,
  Package,
  deletePackage,
} from "../../hooks/restAPIPackage";
import PackageForm, { AlertMessageProps } from "./PackageForm";
import "./ProductListPage.css";

const PackageListPage: React.FC = () => {
  const [packages, setPackage] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessageProps>({
    title: "",
    message: "",
  });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await getPackages();
      setPackage(data);
      console.log("Packages:", data);
    } catch (err) {
      console.error("Gagal mengambil data paket:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPackage(null);
    setShowModal(true);
  };

  const handleEdit = (packages: Package) => {
    const sanitizedPackage = {
      ...packages,
      price: packages.price.toString().split(".")[0],
    };
    setEditingPackage(sanitizedPackage);
    setShowModal(true);
  };

  const handleSuccess = () => {
    const info = editingPackage ? "Diubah" : "Ditambah";
    setShowModal(false);
    setEditingPackage(null);
    fetchPackages();
    setAlertMessage({ title: "Berhasil", message: `Paket Berhasil ${info}!` });
    setShowAlert(true);
  };

  const confirmDelete = (packageId: string) => {
    setSelectedPackageId(packageId);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    try {
      await deletePackage(selectedPackageId);
      setAlertMessage({
        title: "Berhasil",
        message: "Paket Berhasil Dihapus!",
      });
      fetchPackages();
    } catch (error) {
      console.error("Gagal menghapus paket:", error);
      setAlertMessage({
        title: "Gagal",
        message: `Gagal menghapus paket: ${error}`,
      });
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
          <IonTitle>Data Paket</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={handleAdd}>
          Tambah Paket
        </IonButton>

        {loading ? (
          <IonSpinner name="crescent" className="ion-spin-list" />
        ) : (
          <IonList>
            {packages.map((pkg) => (
              <div key={pkg.id}>
                <IonItem color="light">
                  <IonLabel>
                    <h2>{pkg.name}</h2>
                    <h2>Harga: Rp {parseInt(pkg.price).toLocaleString()}</h2>
                  </IonLabel>
                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={() => handleEdit(pkg)}
                  >
                    <IonIcon icon={pencil} />
                  </IonButton>
                  <IonButton
                    fill="clear"
                    color="danger"
                    slot="end"
                    onClick={() => confirmDelete(pkg.id)}
                  >
                    <IonIcon icon={trashBin} />
                  </IonButton>
                </IonItem>
              </div>
            ))}
          </IonList>
        )}

        <PackageForm
          isOpen={showModal}
          initialPackage={editingPackage}
          onSuccess={handleSuccess}
          onDidDismiss={() => {
            setShowModal(false);
            setEditingPackage(null);
          }}
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
          header="Hapus Paket?"
          message="Yakin ingin menghapus paket?"
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

export default PackageListPage;

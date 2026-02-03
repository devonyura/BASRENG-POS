import { useEffect, useState } from 'react';
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonButtons,
	IonButton,
	IonTitle,
	IonContent,
	IonItem,
	IonInput,
	IonRadioGroup,
	IonRadio,
	IonLabel,
} from '@ionic/react';
import { useHistory, useLocation, Redirect } from 'react-router-dom';
import { updateData } from '../hooks/restAPIRequest';
import { useAuth } from "../hooks/useAuthCookie";
import AlertInfo, { AlertState } from '../components/AlertInfo';

const StudentEdit: React.FC = () => {

	// setup Alert
	const [alert, setAlert] = useState<AlertState>({
		showAlert: false,
		header: '',
		alertMesage: '',
		hideButton: false,
	});

	const { token } = useAuth();

	if (!token) {
		return <Redirect to="/login" />
	}

	const location = useLocation<{ student: any }>();
	const history = useHistory();
	const studentData = location.state?.student || null;

	useEffect(() => {
		if (!studentData) {
			history.replace('/student-list');
		}
	}, [studentData, history]);

	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [gender, setGender] = useState('L');

	useEffect(() => {
		if (studentData) {
			setName(studentData.name);
			setAddress(studentData.address);
			setGender(studentData.gender);
		}
	}, [studentData]);

	const checkForm = (name: string, value: any) => {
		if (value === null || !value) {
			setAlert({
				showAlert: true,
				header: "Peringatan",
				alertMesage: 'Isian ' + name + " tidak boleh kosong!"
			});
			return false
		}
		return true
	}

	const handleEditStudent = async () => {

		const updatedStudent = { name, address, gender };

		if (!checkForm("Nama", updatedStudent.name)) {
			return
		}
		if (!checkForm("Alamat", updatedStudent.address)) {
			return
		}

		setAlert({
			showAlert: true,
			header: "Sedang menyimpan",
			alertMesage: "Tunggu Sebentar...",
			hideButton: true,
		});

		try {
			const result = await updateData(studentData.id, updatedStudent);
			if (result.success) {
				setAlert({
					showAlert: true,
					header: "Berhasil",
					alertMesage: "Data Murid diperbaharui."
				});
				history.push('/student-list');
			} else {
				setAlert({
					showAlert: true,
					header: "Gagal!",
					alertMesage: result.error
				});
			}
		} catch (error: any) {
			setAlert({
				showAlert: true,
				header: "Kasalahan Server!",
				alertMesage: error.error
			});
		}
	};

	const handleCancel = () => {
		history.push("/student-list", { dontRefresh: true });
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonButton onClick={handleCancel}>Batal</IonButton>
					</IonButtons>
					<IonTitle>Edit Siswa</IonTitle>
					<IonButtons slot="end">
						<IonButton strong={true} onClick={handleEditStudent}>
							Simpan
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<IonItem>
					<IonInput label="Nama" labelPlacement="floating" value={name} onIonInput={(e) => setName(e.detail.value || '')} type="text" placeholder="Masukkan Nama" />
				</IonItem>
				<IonItem>
					<IonInput label="Address" labelPlacement="floating" value={address} onIonInput={(e) => setAddress(e.detail.value || '')} type="text" placeholder="Masukkan Alamat" />
				</IonItem>
				<IonItem>
					<IonLabel id="gender">Gender</IonLabel>
					<IonRadioGroup value={gender} onIonChange={(e) => setGender(e.detail.value)}>
						<IonRadio value="L">Pria</IonRadio>
						<br />
						<IonRadio value="P">Wanita</IonRadio>
					</IonRadioGroup>
				</IonItem>
			</IonContent>

			<AlertInfo
				isOpen={alert.showAlert}
				header={alert.header}
				message={alert.alertMesage}
				onDidDismiss={() => setAlert(prevState => ({ ...prevState, showAlert: false }))}
				hideButton={alert.hideButton}
			/>
		</IonPage>
	);
};

export default StudentEdit;

import { useState } from 'react';
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
	IonicSafeString,
} from '@ionic/react';
import { useHistory, Redirect } from 'react-router-dom';
import { saveData, ApiResponse } from '../hooks/restAPIRequest';
import { useStudent } from '../context/StudentContext'
import { useAuth } from "../hooks/useAuthCookie";
import AlertInfo, { AlertState } from '../components/AlertInfo';

const StudentAdd: React.FC = () => {

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


	const history = useHistory();
	const { updated, setUpdated } = useStudent();

	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [gender, setGender] = useState('L');


	const resetForm = () => {
		setName('');
		setAddress('');
		setGender('L');
	};

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

	const handleAddStudent = async () => {

		setAlert({
			showAlert: true,
			header: "Sedang menyimpan",
			alertMesage: "Tunggu Sebentar...",
			hideButton: true,
		});

		const newStudent = { name, address, gender }

		if (!checkForm("Nama", newStudent.name)) {
			return
		}
		if (!checkForm("Alamat", newStudent.address)) {
			return
		}

		try {

			const result = await saveData(newStudent)

			if (result.success) {
				resetForm();
				setAlert({
					showAlert: true,
					header: "Berhasil",
					alertMesage: "Data Murid ditambahkan."
				});

				setUpdated(true);
				history.push('/student-list')
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
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonButton onClick={() => history.goBack()}>Batal</IonButton>
					</IonButtons>
					<IonTitle>Tambah Siswa</IonTitle>
					<IonButtons slot="end">
						<IonButton strong={true} onClick={handleAddStudent}>
							Simpan
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<IonItem>
					<IonInput
						label="Nama"
						labelPlacement="floating"
						value={name}
						onIonInput={(e) => setName(e.detail.value!)}
						type="text"
						placeholder="Masukkan Nama"
					/>
				</IonItem>
				<IonItem>
					<IonInput
						label="Alamat"
						labelPlacement="floating"
						value={address}
						onIonInput={(e) => setAddress(e.detail.value!)}
						type="text"
						placeholder="Masukkan Alamat"
					/>
				</IonItem>
				<IonItem>
					<IonLabel id='gender'>Gender</IonLabel>
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

export default StudentAdd;

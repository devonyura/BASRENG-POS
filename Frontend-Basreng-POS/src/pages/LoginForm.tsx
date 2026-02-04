import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonPage, IonTitle, IonToolbar, IonImg, IonInputPasswordToggle, IonSegment, IonToast, IonText } from '@ionic/react';
import './LoginForm.css';
import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { loginRequest } from '../hooks/restAPIRequest';
import { useAuth } from "../hooks/useAuthCookie";
import { warning } from 'ionicons/icons';
import AlertInfo, { AlertState } from "../components/AlertInfo";

interface LocationState {
	isTokenExpired?: boolean;
	dontRefresh?: boolean;
}

const LoginForm: React.FC = () => {

	// setup Alert
	const [alert, setAlert] = useState<AlertState>({
		showAlert: false,
		header: '',
		alertMesage: '',
		hideButton: false,
	});

	const { login, token, role } = useAuth();
	const history = useHistory();
	const location = useLocation<LocationState>();
	const [isTokenExpired, setIsTokenExpired] = useState(location.state?.isTokenExpired || false);

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		if (token && role) {
			history.replace("/dashboard", { isTokenExpired: true });
		}
	}, [token, role, history]);

	const resetForm = () => {
		setUsername('');
		setPassword('');
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

	const handleLogin = async () => {

		const authData = { username, password }

		if (!checkForm("Username", authData.username) || !checkForm("Password", authData.password)) {
			return
		}

		setAlert({
			showAlert: true,
			header: "Sedang Login",
			alertMesage: "Tunggu Sebentar...",
			hideButton: true,
		});

		try {

			const result = await loginRequest(authData)

			if (result.success) {
				const token = result.data.token;
				login(token);
				setAlert({
					showAlert: true,
					header: "Berhasil",
					alertMesage: "Semoga dagangannya laris ya!."
				});
				setIsTokenExpired(false)
				history.push('/dashboard')
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
				header: "Gagal!",
				alertMesage: "Username / Password Salah atau jaringan bermasalah"
			});
		}

		resetForm();
	}

	useEffect(() => {
		if (token) {
			history.replace("/dashboard", { isTokenExpired: true })
		}
	}, [token, history, isTokenExpired]);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Basreng POS</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<IonImg src="/icon.png" className="app-logo" alt="App Logo" />
				{isTokenExpired ? (
					<IonToast
						isOpen={true}
						message={isTokenExpired ? "Sessi habis. Silahkan Login Kembali!" : "Kamu Sudah Login!"}
						duration={6000} position='middle'
						swipeGesture="vertical"
						icon={warning}
						buttons={[
							{
								text: 'Dismiss',
								role: 'cancel',
							},
						]}
					></IonToast>
				) : ''
				}
				<IonSegment className="login-container">
					<IonText>
						<h3>Masuk</h3>
					</IonText>
					<IonItem>
						<IonInput
							label="Username"
							placeholder="Masukkan Username"
							value={username}
							onIonInput={(e) => setUsername(e.detail.value!)}
						/>
					</IonItem>
					<IonItem>
						<IonInput
							label="Password"
							placeholder="Masukkan Password"
							value={password}
							onIonInput={(e) => setPassword(e.detail.value!)}
							type="password"
						>
							<IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
						</IonInput>

					</IonItem>
					<IonButton expand="full" shape='round' className="login-button" color="secondary" onClick={handleLogin}>Masuk</IonButton>
				</IonSegment>
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

export default LoginForm;

import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
	server: {
		cleartext: true,
	},
	appId: 'io.ionic.starter',
	appName: 'Basreng-POS',
	webDir: 'docs',
	plugins: {
		SplashScreen: {
			launchShowDuration: 3000, // Durasi splash screen dalam ms (3 detik)
			launchAutoHide: true, // Sembunyikan otomatis setelah durasi
			androidScaleType: "CENTER_CROP", // Sesuaikan posisi gambar di Android
			showSpinner: false, // Matikan spinner default
			backgroundColor: "#ffffff", // Warna latar belakang
			androidSplashResourceName: "splash", // Nama gambar splash di Android
			iosSplashResourceName: "splash", // Nama gambar splash di iOS
		},
	},
};

export default config;

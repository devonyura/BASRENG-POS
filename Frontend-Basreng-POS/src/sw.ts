import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Ada update baru! Muat ulang sekarang?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App siap digunakan secara offline.");
  },
});

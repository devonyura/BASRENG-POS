export function rupiahFormat(value: string | number, withRp: boolean = true) {
  // Menghapus titik desimal yang tidak diperlukan
  let cleanValue = value.toString().replace(/\.00$/, "").replace(/\./g, "");

  // Konversi ke angka
  let number = parseInt(cleanValue, 10);

  return (withRp) ? 'Rp.' + number.toLocaleString("id-ID") : '' + number.toLocaleString("id-ID");
}


export function generateReceiptNumber(branchID: number, username: string | any): string {
  const now = new Date();

  const ddmmyy = `${String(now.getDate()).padStart(2, "0")}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getFullYear()).slice(2)}`;

  const hh = String(now.getHours()).padStart(2, "0");
  const ii = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const hhiiss = `${hh}${ii}${ss}`;

  return `C${branchID}-${ddmmyy}-${hhiiss}-${username.toUpperCase()}`;
}


export function calculateChange(cashGiven: number, total: number): number {
  if (cashGiven && cashGiven > total) {
    return cashGiven - total;
  }
  return 0;
};

export const shortDate = (tanggalString: string): string => {
  const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const date = new Date(tanggalString);
  if (isNaN(date.getTime())) return "-"; // jika string tidak valid

  const hari = date.getDate();
  const bulan = bulanPendek[date.getMonth()];
  const tahun = date.getFullYear().toString().slice(-2); // ambil 2 digit terakhir

  return `${hari} ${bulan} ${tahun}`;
};

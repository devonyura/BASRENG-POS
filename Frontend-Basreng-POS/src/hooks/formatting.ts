export function rupiahFormat(value: string | number | null | undefined, withRp: boolean = true) {
  if (value === null || value === undefined || value === "") {
    return withRp ? "Rp.0" : "0";
  }

  let cleanValue = value
    .toString()
    .replace(/\.00$/, "")
    .replace(/\./g, "");

  let number = parseInt(cleanValue, 10);

  if (isNaN(number)) {
    number = 0;
  }

  return withRp
    ? "Rp." + number.toLocaleString("id-ID")
    : number.toLocaleString("id-ID");
}

export const rupiahFormatBarChart = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

export function parseWeightGrams(quantity?: string | number | null) {
  if (quantity === null || quantity === undefined || quantity === '') {
    return null;
  }

  if (typeof quantity === 'number') {
    return Number.isFinite(quantity) ? quantity : null;
  }

  const sanitized = quantity.replace(/[^\d]/g, '');
  if (!sanitized) {
    return null;
  }

  const parsed = Number(sanitized);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatProductName(
  name: string,
  quantity?: string | number | null
) {
  const formattedWeight = formatWeight(quantity);

  if (!formattedWeight) {
    return name;
  }

  return `${name} (${formattedWeight})`;
}

export function formatWeight(
  quantity?: string | number | null
): string | null {
  if (quantity === undefined || quantity === null || quantity === "") {
    return null;
  }

  const grams = Number(quantity);

  if (isNaN(grams) || grams <= 0) {
    return null;
  }

  // ✅ Convert ke KG jika >= 1000 gr
  if (grams >= 1000) {
    const kg = grams / 1000;

    // hilangkan .0 jika bulat
    return `${Number.isInteger(kg) ? kg : kg.toFixed(2)}kg`;
  }

  return `${grams}gr`;
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
  const tahun = date.getFullYear().toString(); // ambil 2 digit terakhir

  return `${hari} ${bulan} ${tahun}`;
};

export function formatProductWithWeight(
  name: string,
  weight?: string | number | null
): string {
  if (!name) return "-";

  const grams = Number(weight);

  if (!weight || isNaN(grams) || grams <= 0) {
    return name;
  }

  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${name} (${Number.isInteger(kg) ? kg : kg.toFixed(2)}kg)`;
  }

  return `${name} (${grams}gr)`; // ✅ INI YANG KEMARIN HILANG
}
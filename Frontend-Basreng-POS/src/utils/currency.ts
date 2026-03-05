export function formatRupiah(value: number | string): string {
  if (!value) return "";

  const number = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

export function parseRupiah(value: string): number {
  if (!value) return 0;

  return Number(value.replace(/[^\d]/g, ""));
}
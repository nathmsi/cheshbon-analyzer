export function formatCurrency(
  value: number,
  locale: "he" | "en" = "he",
): string {
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale: "he" | "en" = "he"): string {
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL").format(
    value,
  );
}

export function formatPercent(value: number, locale: "he" | "en" = "he"): string {
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

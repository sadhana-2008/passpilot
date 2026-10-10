/**
 * Format date in Indian locale (DD/MM/YYYY or standard format)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format INR currency
 */
export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate middle of long strings (e.g. ARN / application ID)
 */
export function truncateId(id: string, start = 6, end = 4): string {
  if (!id || id.length <= start + end) return id;
  return `${id.slice(0, start)}...${id.slice(-end)}`;
}

// Date/BigInt utility functions
export function dateToBigInt(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

export function bigIntToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

export function bigIntToDateString(ns: bigint): string {
  const date = bigIntToDate(ns);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** @deprecated Use formatINR from currencyUtils instead */
export function formatCurrency(amount: bigint): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function truncatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-6)}`;
}

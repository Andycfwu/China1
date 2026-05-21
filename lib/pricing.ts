export function estimateUnitPrice(price: string): number {
  const dollarMatches = price.match(/\$\s*\d+(?:\.\d{1,2})?/g);
  const source = dollarMatches?.[0] ?? price.match(/\d+(?:\.\d{1,2})?/)?.[0];
  const amount = Number(source?.replace("$", "").trim() ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

// TODO: Confirm this against the restaurant's accountant/POS settings.
// New Jersey's standard sales tax is 6.625%, but China 1 currently wants 7%.
export const TAX_RATE = 0.07;

export function calculateOrderTotalCents(subtotalCents: number) {
  const safeSubtotalCents = Math.max(0, Math.round(subtotalCents));
  const salesTaxCents = Math.round(safeSubtotalCents * TAX_RATE);
  const totalCents = safeSubtotalCents + salesTaxCents;

  return {
    salesTaxCents,
    subtotalCents: safeSubtotalCents,
    totalCents,
  };
}

export function calculateOrderTotals(subtotal: number) {
  const subtotalCents = Math.round(subtotal * 100);
  const totals = calculateOrderTotalCents(subtotalCents);

  return {
    salesTax: totals.salesTaxCents / 100,
    subtotal: totals.subtotalCents / 100,
    total: totals.totalCents / 100,
  };
}

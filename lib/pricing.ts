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

export function calculateOrderTotals(subtotal: number) {
  const subtotalCents = Math.round(subtotal * 100);
  const salesTaxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + salesTaxCents;

  return {
    salesTax: salesTaxCents / 100,
    subtotal: subtotalCents / 100,
    total: totalCents / 100,
  };
}

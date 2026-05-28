export type PriceOption = {
  id: string;
  label: string;
  price: string;
  unitPriceCents: number;
};

function dollarsToCents(amount: number) {
  return Math.round(amount * 100);
}

function normalizePriceOptionId(label: string, index: number) {
  const normalized = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `option-${index + 1}`;
}

export function estimateUnitPrice(price: string): number {
  const dollarMatches = price.match(/\$\s*\d+(?:\.\d{1,2})?/g);
  const source = dollarMatches?.[0] ?? price.match(/\d+(?:\.\d{1,2})?/)?.[0];
  const amount = Number(source?.replace("$", "").trim() ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

export function parsePriceOptions(price: string): PriceOption[] {
  const parts = price
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const sourceParts = parts.length > 0 ? parts : [price.trim()];
  const usedIds = new Set<string>();

  return sourceParts.map((part, index) => {
    const priceMatch = part.match(/\$\s*\d+(?:\.\d{1,2})?/);
    const rawPrice = priceMatch?.[0] ?? part.match(/\d+(?:\.\d{1,2})?/)?.[0] ?? "0";
    const amount = Number(rawPrice.replace("$", "").trim());
    const labelSource = priceMatch
      ? part.replace(priceMatch[0], "").trim()
      : part.replace(rawPrice, "").trim();
    const label =
      labelSource ||
      (sourceParts.length === 1 ? "Regular" : `Option ${index + 1}`);
    const baseId = normalizePriceOptionId(label, index);
    let id = baseId;
    let duplicateIndex = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${duplicateIndex}`;
      duplicateIndex += 1;
    }

    usedIds.add(id);

    return {
      id,
      label,
      price: `$${amount.toFixed(2)}`,
      unitPriceCents: Number.isFinite(amount) ? dollarsToCents(amount) : 0,
    };
  });
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
export const CASH_APP_FEE_CENTS = 100;

type PaymentMethodForTotals = string | null | undefined;

export function isCashAppPayment(paymentMethod?: PaymentMethodForTotals) {
  return (paymentMethod ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .includes("cashapp");
}

export function calculateOrderTotalCents(
  subtotalCents: number,
  paymentMethod?: PaymentMethodForTotals,
) {
  const safeSubtotalCents = Math.max(0, Math.round(subtotalCents));
  const salesTaxCents = Math.round(safeSubtotalCents * TAX_RATE);
  const cashAppFeeCents = isCashAppPayment(paymentMethod)
    ? CASH_APP_FEE_CENTS
    : 0;
  const totalCents = safeSubtotalCents + salesTaxCents + cashAppFeeCents;

  return {
    cashAppFeeCents,
    salesTaxCents,
    subtotalCents: safeSubtotalCents,
    totalCents,
  };
}

export function calculateOrderTotals(
  subtotal: number,
  paymentMethod?: PaymentMethodForTotals,
) {
  const subtotalCents = Math.round(subtotal * 100);
  const totals = calculateOrderTotalCents(subtotalCents, paymentMethod);

  return {
    cashAppFee: totals.cashAppFeeCents / 100,
    salesTax: totals.salesTaxCents / 100,
    subtotal: totals.subtotalCents / 100,
    total: totals.totalCents / 100,
  };
}

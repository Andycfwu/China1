import type { StoredOrder } from "@/lib/order-types";
import {
  ITEM_OPTION_GROUP_ID,
  type CartItemModifier,
} from "@/lib/menu-modifiers";
import { calculateOrderTotals, formatCurrency } from "@/lib/pricing";
import {
  getReceiptChineseName,
  normalizeReceiptItemCode,
} from "@/lib/receipt-chinese-names";

function formatReceiptDateTime(value: string) {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

function receiptMoney(value: number) {
  return formatCurrency(value).replace("$", "");
}

function pickupLabel(order: StoredOrder) {
  return order.pickupChoice === "ASAP"
    ? "Online_Pickup ASAP"
    : `Online_Pickup ${order.pickupTime}`;
}

function receiptChineseLabel(item: StoredOrder["items"][number]) {
  return (
    getReceiptChineseName(item.menuItemId) ??
    getReceiptChineseName(item.menuItemNumber)
  );
}

function formatReceiptCode(code: string | null | undefined, fallbackIndex: number) {
  const normalized = normalizeReceiptItemCode(code ?? "");
  const looksLikeMenuCode = /^(?:[A-Z]\d+|[A-Z]|\d+)$/.test(normalized);
  return normalized && looksLikeMenuCode ? `${normalized}.` : `${fallbackIndex}.`;
}

function compactOptionLabel(label: string) {
  const normalized = label.trim().toLowerCase();
  const labels: Record<string, string> = {
    fried: "锅贴",
    lg: "大",
    large: "大",
    noodle: "面",
    plain: "净",
    pt: "小",
    qt: "大",
    rice: "饭",
    sm: "小",
    small: "小",
    steamed: "水饺",
  };

  return labels[normalized] ?? label;
}

function compactModifierLabel(modifier: CartItemModifier) {
  if (modifier.groupId === ITEM_OPTION_GROUP_ID) {
    return compactOptionLabel(modifier.optionLabel);
  }

  const priceSuffix =
    modifier.priceDeltaCents > 0
      ? ` +${receiptMoney(modifier.priceDeltaCents / 100)}`
      : "";

  return `${modifier.groupLabel}: ${modifier.optionLabel}${priceSuffix}`;
}

function compactItemModifiers(item: StoredOrder["items"][number]) {
  const labels: string[] = [];

  if (
    item.selectedPriceLabel &&
    !["Regular", "Base"].includes(item.selectedPriceLabel)
  ) {
    labels.push(compactOptionLabel(item.selectedPriceLabel));
  }

  item.modifiers?.forEach((modifier) => {
    labels.push(compactModifierLabel(modifier));
  });

  return labels;
}

export function ReceiptPrintView({ order }: { order: StoredOrder | null }) {
  if (!order) {
    return null;
  }

  const created = formatReceiptDateTime(order.createdAt);
  const totals = calculateOrderTotals(order.estimatedSubtotal, order.paymentMethod);

  return (
    <section aria-label="Printable receipt" className="receipt-print">
      <header className="receipt-center">
        <h1>CHINA 1</h1>
        <p>450 S Broadway, Camden, NJ 08103</p>
        <p>Tel:(856)342-6828</p>
      </header>

      <p className="receipt-order-type">Online_Order / Pickup</p>

      <div className="receipt-row receipt-meta">
        <span>
          {created.date} {created.time}
        </span>
        <span>{order.orderNumber}</span>
      </div>
      <p className="receipt-server">Server: Online</p>

      <div className="receipt-divider" />

      <p className="receipt-line-text">{pickupLabel(order)}</p>
      <p className="receipt-line-text">Payment: {order.paymentMethod}</p>
      {order.paymentMethod === "Cash App" ? (
        <p className="receipt-line-text">Verify Cash App payment manually</p>
      ) : null}
      <p className="receipt-line-text">Name: {order.customerName}</p>
      <p className="receipt-line-text">Phone: {order.phone}</p>

      <div className="receipt-divider" />

      <div className="receipt-items">
        {order.items.map((item, index) => {
          const codeLabel = formatReceiptCode(
            item.menuItemNumber ?? item.menuItemId,
            index + 1,
          );
          const quantityPrefix = item.quantity > 1 ? `${item.quantity}x ` : "";
          const chineseName = receiptChineseLabel(item);

          return (
            <div className="receipt-item" key={item.cartId}>
              {chineseName ? (
                <p className="receipt-item-chinese">
                  {codeLabel} {quantityPrefix}
                  {chineseName}
                </p>
              ) : null}
              <div className="receipt-item-main">
                <p>
                  {codeLabel} {quantityPrefix}
                  {item.name}
                </p>
                <span>{receiptMoney(item.unitPrice * item.quantity)}</span>
              </div>
              {compactItemModifiers(item).map((modifier) => (
                <p className="receipt-modifier" key={modifier}>
                  [{modifier}]
                </p>
              ))}
              {item.notes ? (
                <p className="receipt-modifier">Note: {item.notes}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {order.specialInstructions ? (
        <>
          <div className="receipt-divider" />
          <p className="receipt-modifier">Order note: {order.specialInstructions}</p>
        </>
      ) : null}

      <div className="receipt-divider" />

      <div className="receipt-totals">
        <div className="receipt-total-row">
          <span>Subtotal:</span>
          <span>{receiptMoney(totals.subtotal)}</span>
        </div>
        <div className="receipt-total-row">
          <span>Tax:</span>
          <span>{receiptMoney(totals.salesTax)}</span>
        </div>
        {order.paymentMethod === "Cash App" ? (
          <div className="receipt-total-row">
            <span>Cash App Fee:</span>
            <span>{receiptMoney(totals.cashAppFee)}</span>
          </div>
        ) : null}
        <div className="receipt-total-row receipt-grand-total">
          <span>Total:</span>
          <span>{receiptMoney(totals.total)}</span>
        </div>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-center receipt-footer-note">
        <p>Prices subject to change.</p>
        <p className="receipt-thank-you">Thank You</p>
      </div>
    </section>
  );
}

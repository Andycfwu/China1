import type { StoredOrder } from "@/lib/order-types";
import { isLunchCartItem } from "@/lib/order-availability";
import { calculateOrderTotals, formatCurrency } from "@/lib/pricing";

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

export function ReceiptPrintView({ order }: { order: StoredOrder | null }) {
  if (!order) {
    return null;
  }

  const created = formatReceiptDateTime(order.createdAt);
  const totals = calculateOrderTotals(order.estimatedSubtotal);

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
      <p className="receipt-line-text">Pay at pickup: {order.paymentMethod}</p>
      <p className="receipt-line-text">Name: {order.customerName}</p>
      <p className="receipt-line-text">Phone: {order.phone}</p>

      <div className="receipt-divider" />

      <div className="receipt-items">
        {order.items.map((item, index) => (
          <div className="receipt-item" key={item.cartId}>
            <div className="receipt-item-main">
              <p>
                {index + 1}. {item.quantity > 1 ? `${item.quantity}x ` : ""}
                {item.name}
              </p>
              <span>{receiptMoney(item.unitPrice * item.quantity)}</span>
            </div>
            {item.selectedPriceLabel &&
            !["Regular", "Base"].includes(item.selectedPriceLabel) ? (
              <p className="receipt-modifier">[Size: {item.selectedPriceLabel}]</p>
            ) : null}
            {item.spicy ? <p className="receipt-modifier">[Hot &amp; Spicy]</p> : null}
            {item.modifiers?.map((modifier) => (
              <p
                className="receipt-modifier"
                key={`${modifier.groupId}-${modifier.optionId}`}
              >
                [{modifier.groupLabel}: {modifier.optionLabel} +
                {receiptMoney(modifier.priceDeltaCents / 100)}]
              </p>
            ))}
            {isLunchCartItem(item) ? (
              <p className="receipt-modifier">[Includes can soda]</p>
            ) : null}
            {item.menuItemId.startsWith("C") ? (
              <p className="receipt-modifier">[Includes egg roll]</p>
            ) : null}
            {item.notes ? <p className="receipt-modifier">[{item.notes}]</p> : null}
          </div>
        ))}
      </div>

      {order.specialInstructions ? (
        <>
          <div className="receipt-divider" />
          <p className="receipt-modifier">[{order.specialInstructions}]</p>
        </>
      ) : null}

      <div className="receipt-divider" />

      <div className="receipt-totals">
        <div className="receipt-total-row">
          <span>Subtotal:</span>
          <span>{receiptMoney(totals.subtotal)}</span>
        </div>
        <div className="receipt-total-row">
          <span>Sales Tax:</span>
          <span>{receiptMoney(totals.salesTax)}</span>
        </div>
        <div className="receipt-total-row receipt-grand-total">
          <span>Estimated Total:</span>
          <span>{receiptMoney(totals.total)}</span>
        </div>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-center receipt-footer-note">
        <p>Prices subject to change.</p>
        <p>Pay at pickup: {order.paymentMethod}</p>
        <p className="receipt-thank-you">Thank You</p>
      </div>
    </section>
  );
}

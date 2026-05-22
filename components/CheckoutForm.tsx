"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Minus, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { restaurantInfo } from "@/lib/menu-data";
import {
  fetchOnlineOrderingOpen,
  subscribeToOrderChanges,
} from "@/lib/order-store";
import {
  getUnavailableLunchCartItems,
  isLunchCartItem,
  LUNCH_CHECKOUT_BLOCK_MESSAGE,
  LUNCH_SPECIAL_HOURS_MESSAGE,
} from "@/lib/order-availability";
import type { PaymentMethod, PickupTimeChoice, StoredOrder } from "@/lib/order-types";
import { calculateOrderTotals, formatCurrency } from "@/lib/pricing";

export function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupChoice, setPickupChoice] = useState<PickupTimeChoice>("ASAP");
  const [laterTime, setLaterTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<StoredOrder | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [onlineOrderingOpen, setOnlineOrderingOpen] = useState(true);
  const totals = calculateOrderTotals(cart.estimatedSubtotal);
  const unavailableLunchItems = useMemo(
    () => getUnavailableLunchCartItems(cart.items, now),
    [cart.items, now],
  );
  const hasUnavailableLunchItems = unavailableLunchItems.length > 0;

  useEffect(() => {
    let isMounted = true;

    async function loadOnlineOrderingStatus() {
      try {
        const open = await fetchOnlineOrderingOpen();
        if (isMounted) {
          setOnlineOrderingOpen(open);
        }
      } catch {
        if (isMounted) {
          setOnlineOrderingOpen(true);
        }
      }
    }

    void loadOnlineOrderingStatus();
    const unsubscribe = subscribeToOrderChanges(() => {
      void loadOnlineOrderingStatus();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const canSubmit = useMemo(
    () =>
      onlineOrderingOpen &&
      !hasUnavailableLunchItems &&
      cart.items.length > 0 &&
      customerName.trim().length > 1 &&
      phone.trim().length >= 7 &&
      (pickupChoice === "ASAP" || laterTime.length > 0),
    [
      cart.items.length,
      customerName,
      hasUnavailableLunchItems,
      laterTime,
      onlineOrderingOpen,
      phone,
      pickupChoice,
    ],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onlineOrderingOpen) {
      setSubmitError("Online ordering is currently closed. Please call the restaurant to order.");
      return;
    }

    if (hasUnavailableLunchItems) {
      setSubmitError(LUNCH_CHECKOUT_BLOCK_MESSAGE);
      return;
    }

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: phone.trim(),
          items: cart.items.map((item) => ({
            menuItemId: item.menuItemId,
            modifiers: (item.modifiers ?? []).map((modifier) => ({
              groupId: modifier.groupId,
              optionId: modifier.optionId,
            })),
            notes: item.notes,
            quantity: item.quantity,
            selectedPriceId: item.selectedPriceId,
          })),
          paymentMethod,
          pickupTime: pickupChoice === "ASAP" ? "ASAP" : laterTime,
          pickupType: pickupChoice,
          specialInstructions: specialInstructions.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        order?: StoredOrder;
      };

      if (!response.ok || !result.order) {
        throw new Error(
          result.error ?? "Could not send this order. Please call the restaurant.",
        );
      }

      const order = result.order;

      cart.clearCart();
      setSubmittedOrder(order);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not send this order. Please call the restaurant.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedOrder) {
    return (
      <div className="paper-card p-6 text-center sm:p-10">
        <CheckCircle2 className="mx-auto text-[var(--deep-bamboo)]" size={54} />
        <h1 className="mt-4 text-3xl font-black text-[var(--deep-bamboo)]">
          Your order was sent.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold leading-8 text-stone-800">
          Please pay at pickup. Your order number is{" "}
          <span className="font-black text-[var(--china-red)]">
            {submittedOrder.orderNumber}
          </span>
          .
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--deep-bamboo)] px-5 py-3 font-black text-white"
            href="/order"
          >
            Start another order
          </Link>
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--warm-border)] bg-white px-5 py-3 font-black text-stone-900"
            onClick={() => router.push("/")}
            type="button"
          >
            Back home
          </button>
        </div>
      </div>
    );
  }

  if (!onlineOrderingOpen) {
    return (
      <div className="paper-card p-6 text-center sm:p-10">
        <h1 className="text-3xl font-black text-[var(--deep-bamboo)]">
          Online ordering is currently closed.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold leading-8 text-stone-800">
          Please call the restaurant to order.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--china-red)] px-5 py-3 font-black text-white"
            href={`tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`}
          >
            Call {restaurantInfo.primaryPhone}
          </a>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--warm-border)] bg-white px-5 py-3 font-black text-stone-900"
            href="/order"
          >
            View menu
          </Link>
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="paper-card p-6 text-center sm:p-10">
        <h1 className="text-3xl font-black text-[var(--deep-bamboo)]">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold leading-8 text-stone-800">
          Add menu items first, then come back to checkout.
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--china-red)] px-5 py-3 font-black text-white"
          href="/order"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <form className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]" onSubmit={handleSubmit}>
      <section className="paper-card p-5 sm:p-6">
        <h1 className="text-3xl font-black text-[var(--deep-bamboo)]">
          Checkout
        </h1>
        <p className="mt-2 text-base font-semibold leading-7 text-stone-700">
          Pickup only. Pay at pickup with cash or Cash App.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-stone-800">Name</span>
            <input
              className="mt-1 min-h-12 w-full rounded-md border border-[var(--warm-border)] bg-white px-3 font-semibold outline-none focus:border-[var(--deep-bamboo)]"
              onChange={(event) => setCustomerName(event.target.value)}
              required
              value={customerName}
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-stone-800">Phone number</span>
            <input
              className="mt-1 min-h-12 w-full rounded-md border border-[var(--warm-border)] bg-white px-3 font-semibold outline-none focus:border-[var(--deep-bamboo)]"
              onChange={(event) => setPhone(event.target.value)}
              required
              type="tel"
              value={phone}
            />
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-black text-stone-800">Pickup time</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(["ASAP", "Later"] as PickupTimeChoice[]).map((choice) => (
              <label
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 font-black ${
                  pickupChoice === choice
                    ? "border-[var(--deep-bamboo)] bg-[var(--jade-green)] text-[var(--dark-forest)]"
                    : "border-[var(--warm-border)] bg-white text-stone-800"
                }`}
                key={choice}
              >
                <input
                  checked={pickupChoice === choice}
                  className="size-4"
                  onChange={() => setPickupChoice(choice)}
                  type="radio"
                />
                {choice === "ASAP" ? "ASAP" : "Schedule later"}
              </label>
            ))}
          </div>
          {pickupChoice === "Later" ? (
            <label className="mt-3 block">
              <span className="sr-only">Later pickup time</span>
              <input
                className="min-h-12 w-full rounded-md border border-[var(--warm-border)] bg-white px-3 font-semibold outline-none focus:border-[var(--deep-bamboo)]"
                onChange={(event) => setLaterTime(event.target.value)}
                required
                type="datetime-local"
                value={laterTime}
              />
            </label>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-sm font-black text-stone-800">Payment method</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(["Cash", "Cash App"] as PaymentMethod[]).map((method) => (
              <label
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 font-black ${
                  paymentMethod === method
                    ? "border-[var(--china-red)] bg-red-50 text-[var(--china-red)]"
                    : "border-[var(--warm-border)] bg-white text-stone-800"
                }`}
                key={method}
              >
                <input
                  checked={paymentMethod === method}
                  className="size-4"
                  onChange={() => setPaymentMethod(method)}
                  type="radio"
                />
                {method}
              </label>
            ))}
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-black text-stone-800">
            Special instructions
          </span>
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border border-[var(--warm-border)] bg-white p-3 font-semibold outline-none focus:border-[var(--deep-bamboo)]"
            onChange={(event) => setSpecialInstructions(event.target.value)}
            placeholder="Anything the kitchen should know?"
            value={specialInstructions}
          />
        </label>

        {hasUnavailableLunchItems ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-black leading-6 text-[var(--china-red)]">
            <p>{LUNCH_CHECKOUT_BLOCK_MESSAGE}</p>
            <p className="mt-1 text-stone-700">{LUNCH_SPECIAL_HOURS_MESSAGE}</p>
            <p className="mt-2 text-stone-700">
              Lunch items in cart:{" "}
              {unavailableLunchItems.map((item) => item.name).join(", ")}
            </p>
          </div>
        ) : null}

        <button
          className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-md bg-[var(--china-red)] px-5 py-3 text-lg font-black text-white transition hover:bg-[var(--dark-red)] disabled:cursor-not-allowed disabled:bg-stone-400"
          disabled={!canSubmit || isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Sending order..." : "Submit pickup order"}
        </button>
        {submitError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-black leading-6 text-[var(--china-red)]">
            {submitError}
          </p>
        ) : null}
        <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
          Your order was sent. Please pay at pickup. Prices subject to change.
        </p>
      </section>

      <section className="paper-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-2xl font-black text-[var(--deep-bamboo)]">
          <Clock size={22} />
          Order review
        </h2>
        <div className="mt-4 space-y-3">
          {cart.items.map((item) => (
            <div className="rounded-xl border border-green-900/10 bg-white p-3" key={item.cartId}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black leading-5 text-stone-950">
                    {item.quantity}x {item.name}
                  </p>
                  {item.selectedPriceLabel &&
                  !["Regular", "Base"].includes(item.selectedPriceLabel) ? (
                    <p className="mt-1 text-xs font-black uppercase text-[var(--deep-bamboo)]">
                      Size: {item.selectedPriceLabel}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold text-stone-600">
                    {item.price}
                  </p>
                  {item.modifiers?.map((modifier) => (
                    <p
                      className="mt-1 text-xs font-black uppercase text-stone-700"
                      key={`${modifier.groupId}-${modifier.optionId}`}
                    >
                      {modifier.groupLabel}: {modifier.optionLabel} +
                      {formatCurrency(modifier.priceDeltaCents / 100)}
                    </p>
                  ))}
                  {isLunchCartItem(item) ? (
                    <p className="mt-1 text-xs font-black uppercase text-stone-700">
                      Includes can soda
                    </p>
                  ) : null}
                  {item.menuItemId.startsWith("C") ? (
                    <p className="mt-1 text-xs font-black uppercase text-stone-700">
                      Includes egg roll
                    </p>
                  ) : null}
                </div>
                <button
                  aria-label={`Remove ${item.name}`}
                  className="text-stone-500 hover:text-[var(--china-red)]"
                  onClick={() => cart.removeItem(item.cartId)}
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  className="grid size-9 place-items-center rounded-md border border-[var(--warm-border)] bg-white text-stone-900"
                  onClick={() => cart.updateQuantity(item.cartId, item.quantity - 1)}
                  type="button"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-black">{item.quantity}</span>
                <button
                  className="grid size-9 place-items-center rounded-md border border-[var(--warm-border)] bg-white text-stone-900"
                  onClick={() => cart.updateQuantity(item.cartId, item.quantity + 1)}
                  type="button"
                >
                  <Plus size={16} />
                </button>
                <span className="ml-auto font-black text-[var(--china-red)]">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </div>
              <label className="mt-3 block">
                <span className="text-xs font-black uppercase text-stone-500">
                  Item notes
                </span>
                <input
                  className="mt-1 min-h-10 w-full rounded-md border border-[var(--warm-border)] px-3 text-sm font-semibold outline-none focus:border-[var(--deep-bamboo)]"
                  onChange={(event) => cart.updateNotes(item.cartId, event.target.value)}
                  placeholder="No onions, sauce on side..."
                  value={item.notes}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[var(--warm-border)] pt-4">
          <div className="space-y-2 font-black">
            <div className="flex justify-between gap-3">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Sales Tax</span>
              <span>{formatCurrency(totals.salesTax)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-[var(--warm-border)] pt-2 text-xl text-[var(--deep-bamboo)]">
              <span>Estimated Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
            Pay at pickup: Cash or Cash App. Prices subject to change.
          </p>
        </div>
      </section>
    </form>
  );
}

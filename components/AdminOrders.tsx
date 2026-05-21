"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Clock, Printer, RefreshCw } from "lucide-react";
import { ReceiptPrintView } from "@/components/ReceiptPrintView";
import {
  fetchOnlineOrderingOpen,
  fetchStoredOrders,
  isSupabaseConfigured,
  markStoredOrderPrinted,
  OrderStoreError,
  subscribeToOrderChanges,
  updateOnlineOrderingOpen,
  updateStoredOrderStatus,
} from "@/lib/order-store";
import type { OrderStatus, StoredOrder } from "@/lib/order-types";
import { calculateOrderTotals, formatCurrency } from "@/lib/pricing";

const ADMIN_UNLOCK_KEY = "china1-admin-unlocked";
const SOUND_ALERTS_KEY = "china1-sound-alerts-enabled";
const adminPin = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "";
const statuses: OrderStatus[] = [
  "New",
  "Accepted",
  "Ready",
  "Completed",
  "Cancelled",
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminOrders() {
  const [isUnlocked, setIsUnlocked] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.sessionStorage.getItem(ADMIN_UNLOCK_KEY) === "true",
  );
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [printOrder, setPrintOrder] = useState<StoredOrder | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [onlineOrderingOpen, setOnlineOrderingOpen] = useState(true);
  const [isSavingOrderingStatus, setIsSavingOrderingStatus] = useState(false);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.localStorage.getItem(SOUND_ALERTS_KEY) === "true",
  );
  const [soundAlertMessage, setSoundAlertMessage] = useState("");
  const [highlightedOrderIds, setHighlightedOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedOrdersRef = useRef(false);

  async function playOrderAlert() {
    try {
      const AudioContextClass =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        setSoundAlertMessage("This browser does not support sound alerts.");
        return;
      }

      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;

      if (context.state === "suspended") {
        await context.resume();
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.setValueAtTime(660, context.currentTime + 0.16);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.38);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.42);
      setSoundAlertMessage("");
    } catch {
      setSoundAlertMessage(
        "Sound was blocked by the browser. Click Enable Sound Alerts again.",
      );
    }
  }

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    let isMounted = true;

    const loadOrders = async () => {
      setLoadError("");

      try {
        const [nextOrders, nextOnlineOrderingOpen] = await Promise.all([
          fetchStoredOrders(),
          fetchOnlineOrderingOpen(),
        ]);
        if (isMounted) {
          const nextOrderIds = new Set(nextOrders.map((order) => order.id));

          if (hasLoadedOrdersRef.current) {
            const newOrderIds = nextOrders
              .map((order) => order.id)
              .filter((orderId) => !knownOrderIdsRef.current.has(orderId));

            if (newOrderIds.length > 0) {
              setHighlightedOrderIds((currentIds) => {
                const nextIds = new Set(currentIds);
                newOrderIds.forEach((orderId) => nextIds.add(orderId));
                return nextIds;
              });

              window.setTimeout(() => {
                setHighlightedOrderIds((currentIds) => {
                  const nextIds = new Set(currentIds);
                  newOrderIds.forEach((orderId) => nextIds.delete(orderId));
                  return nextIds;
                });
              }, 8000);

              if (soundAlertsEnabled) {
                void playOrderAlert();
              }
            }
          } else {
            hasLoadedOrdersRef.current = true;
          }

          knownOrderIdsRef.current = nextOrderIds;
          setOrders(nextOrders);
          setOnlineOrderingOpen(nextOnlineOrderingOpen);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof OrderStoreError
              ? error.message
              : "Could not load orders from Supabase.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();
    const unsubscribe = subscribeToOrderChanges(() => {
      void loadOrders();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isUnlocked, soundAlertsEnabled]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  async function setStatus(order: StoredOrder, status: OrderStatus) {
    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id ? { ...currentOrder, status } : currentOrder,
      ),
    );

    try {
      await updateStoredOrderStatus(order.id, status);
    } catch (error) {
      setLoadError(
        error instanceof OrderStoreError
          ? error.message
          : "Could not update order status.",
      );
    }
  }

  async function handleEnableSoundAlerts() {
    setSoundAlertsEnabled(true);
    window.localStorage.setItem(SOUND_ALERTS_KEY, "true");
    await playOrderAlert();
  }

  async function handleOnlineOrderingToggle() {
    const nextOpen = !onlineOrderingOpen;
    setOnlineOrderingOpen(nextOpen);
    setIsSavingOrderingStatus(true);
    setLoadError("");

    try {
      await updateOnlineOrderingOpen(nextOpen);
    } catch (error) {
      setOnlineOrderingOpen(!nextOpen);
      setLoadError(
        error instanceof OrderStoreError
          ? error.message
          : "Could not update online ordering status.",
      );
    } finally {
      setIsSavingOrderingStatus(false);
    }
  }

  async function handlePrint(order: StoredOrder) {
    const updatedOrder: StoredOrder = {
      ...order,
      printed: true,
    };

    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id ? updatedOrder : currentOrder,
      ),
    );

    try {
      await markStoredOrderPrinted(order.id);
    } catch (error) {
      setLoadError(
        error instanceof OrderStoreError
          ? error.message
          : "Could not mark order as printed.",
      );
    }

    setPrintOrder(updatedOrder);
    window.setTimeout(() => window.print(), 120);
  }

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminPin) {
      setPinError("Admin PIN is not configured. Add NEXT_PUBLIC_ADMIN_PIN to .env.local.");
      return;
    }

    if (pin.trim() !== adminPin) {
      setPinError("Incorrect PIN.");
      return;
    }

    window.sessionStorage.setItem(ADMIN_UNLOCK_KEY, "true");
    setIsUnlocked(true);
    setPin("");
    setPinError("");
  }

  function handleLogout() {
    window.sessionStorage.removeItem(ADMIN_UNLOCK_KEY);
    setIsUnlocked(false);
    setOrders([]);
    setPrintOrder(null);
    setLoadError("");
    setIsLoading(true);
    setOnlineOrderingOpen(true);
    setHighlightedOrderIds(new Set());
    knownOrderIdsRef.current = new Set();
    hasLoadedOrdersRef.current = false;
  }

  if (!isUnlocked) {
    return (
      <div className="mx-auto max-w-md py-8">
        <form className="paper-card p-6 sm:p-8" onSubmit={handleUnlock}>
          <p className="text-sm font-black uppercase text-[var(--china-red)]">
            Staff only
          </p>
          <h1 className="mt-2 text-3xl font-black text-[var(--deep-bamboo)]">
            Admin Orders
          </h1>
          <p className="mt-3 text-base font-semibold leading-7 text-stone-700">
            Enter the admin PIN to view customer pickup orders.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-black text-stone-800">Admin PIN</span>
            <input
              autoComplete="current-password"
              className="mt-1 min-h-12 w-full rounded-md border border-[var(--warm-border)] bg-white px-3 text-lg font-black tracking-widest outline-none focus:border-[var(--deep-bamboo)]"
              inputMode="numeric"
              onChange={(event) => setPin(event.target.value)}
              type="password"
              value={pin}
            />
          </label>

          {pinError ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-black text-[var(--china-red)]">
              {pinError}
            </p>
          ) : null}

          <button
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--deep-bamboo)] px-5 py-3 font-black text-white transition hover:bg-[var(--dark-forest)]"
            type="submit"
          >
            Unlock Orders
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <section className="paper-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-[var(--china-red)]">
                Staff only MVP
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-normal text-[var(--deep-bamboo)] sm:text-5xl">
                Orders
              </h1>
              <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-stone-800">
                Supabase order board for pickup orders. Browser printing is enabled;
                POS and Ethernet thermal printer integration are not connected yet.
              </p>
            </div>
            <button
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-[var(--warm-border)] bg-white px-4 py-2 text-sm font-black text-stone-900 transition hover:bg-[var(--jade-green)]"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--warm-border)] bg-[var(--cream-paper)] p-5 shadow-lg shadow-green-950/5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-sm font-black uppercase text-stone-500">
                Customer ordering
              </p>
              <h2 className="mt-1 text-2xl font-black text-[var(--deep-bamboo)]">
                Online Ordering: {onlineOrderingOpen ? "Open" : "Closed"}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
                Closed mode keeps the menu visible but disables Add to Order and
                checkout.
              </p>
              <button
                className={`mt-4 inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 font-black text-white transition disabled:cursor-wait disabled:opacity-70 ${
                  onlineOrderingOpen
                    ? "bg-[var(--china-red)] hover:bg-[var(--dark-red)]"
                    : "bg-[var(--deep-bamboo)] hover:bg-[var(--dark-forest)]"
                }`}
                disabled={isSavingOrderingStatus}
                onClick={handleOnlineOrderingToggle}
                type="button"
              >
                {isSavingOrderingStatus
                  ? "Saving..."
                  : onlineOrderingOpen
                    ? "Close Online Ordering"
                    : "Open Online Ordering"}
              </button>
            </div>

            <div className="rounded-xl border border-green-900/10 bg-white p-4">
              <p className="text-sm font-black uppercase text-stone-500">
                Sound alerts: {soundAlertsEnabled ? "On" : "Off"}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
                Play a short beep when a new online order arrives.
              </p>
              <button
                className="mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--deep-bamboo)] px-5 py-3 font-black text-white transition hover:bg-[var(--dark-forest)]"
                onClick={handleEnableSoundAlerts}
                type="button"
              >
                {soundAlertsEnabled ? "Sound Alerts Enabled" : "Enable Sound Alerts"}
              </button>
              {soundAlertMessage ? (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-black leading-6 text-[var(--china-red)]">
                  {soundAlertMessage}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-[var(--warm-border)] bg-[var(--cream-paper)] p-5 shadow-lg shadow-green-950/5 sm:p-6">
          <h2 className="text-2xl font-black text-[var(--deep-bamboo)]">
            Future Ethernet Printer TODO
          </h2>
          <div className="mt-3 grid gap-3 text-sm font-semibold leading-6 text-stone-800 md:grid-cols-2">
            <p>
              TODO: add staff login/admin protection before using this page in
              production.
            </p>
            <p>
              TODO: add a local print bridge that watches new Supabase orders,
              formats this same receipt content as ESC/POS commands, sends it
              to PRINTER_HOST=192.168.1.131 on PRINTER_PORT=9100, marks orders
              as printed, and supports manual reprint.
            </p>
          </div>
        </section>

        {!isSupabaseConfigured ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-[var(--china-red)]">
            <h2 className="text-xl font-black">Supabase is not configured</h2>
            <p className="mt-2 text-sm font-semibold leading-6">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
              .env.local, then restart the dev server.
            </p>
          </section>
        ) : null}

        {loadError ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-[var(--china-red)]">
            <h2 className="text-xl font-black">Order board error</h2>
            <p className="mt-2 text-sm font-semibold leading-6">{loadError}</p>
          </section>
        ) : null}

        {isLoading ? (
          <section className="paper-card p-8 text-center">
            <h2 className="text-2xl font-black text-[var(--deep-bamboo)]">
              Loading orders...
            </h2>
          </section>
        ) : sortedOrders.length ? (
          <div className="grid gap-4">
            {sortedOrders.map((order) => (
              <article
                className={`paper-card p-5 transition sm:p-6 ${
                  highlightedOrderIds.has(order.id)
                    ? "border-[var(--china-red)] bg-red-50 shadow-2xl shadow-red-900/20"
                    : ""
                }`}
                key={order.id}
              >
                {(() => {
                  const totals = calculateOrderTotals(order.estimatedSubtotal);

                  return (
                    <>
                <div className="flex flex-col gap-4 border-b border-[var(--warm-border)] pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase text-[var(--china-red)]">
                      {order.orderNumber}
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-stone-950">
                      {order.customerName}
                    </h2>
                    <div className="mt-2 grid gap-1 text-sm font-semibold text-stone-700 sm:grid-cols-2">
                      <p>Phone: {order.phone}</p>
                      <p>Pickup: {order.pickupTime}</p>
                      <p>Payment: {order.paymentMethod} at pickup</p>
                      <p className="flex items-center gap-1">
                        <Clock size={15} />
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        className={`rounded-md px-3 py-2 text-sm font-black transition ${
                          order.status === status
                            ? "bg-[var(--deep-bamboo)] text-white"
                            : "bg-white text-stone-800 ring-1 ring-[var(--warm-border)] hover:bg-[var(--jade-green)]"
                        }`}
                        key={status}
                        onClick={() => setStatus(order, status)}
                        type="button"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_18rem]">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        className="rounded-xl border border-green-900/10 bg-white p-3"
                        key={item.cartId}
                      >
                        <div className="flex justify-between gap-3">
                          <p className="font-black text-stone-950">
                            {item.quantity}x {item.name}
                          </p>
                          <p className="font-black text-[var(--china-red)]">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-stone-600">
                          Listed price: {item.price}
                        </p>
                        {item.notes ? (
                          <p className="mt-2 rounded-md bg-amber-50 p-2 text-sm font-semibold text-stone-800">
                            Note: {item.notes}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-[var(--warm-border)] bg-white p-4">
                    <p className="text-sm font-black uppercase text-stone-500">
                      Status
                    </p>
                      <p className="mt-1 text-xl font-black text-[var(--deep-bamboo)]">
                        {order.status}
                      </p>
                    <p className="mt-1 text-sm font-black text-stone-600">
                      Printed: {order.printed ? "Yes" : "No"}
                    </p>
                    <div className="mt-4 space-y-2 font-black">
                      <div className="flex justify-between gap-3">
                        <span>Estimated subtotal</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Sales Tax</span>
                        <span>{formatCurrency(totals.salesTax)}</span>
                      </div>
                      <div className="flex justify-between gap-3 border-t border-[var(--warm-border)] pt-2 text-lg text-[var(--deep-bamboo)]">
                        <span>Estimated total</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                    {order.specialInstructions ? (
                      <div className="mt-4">
                        <p className="text-sm font-black uppercase text-stone-500">
                          Instructions
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-stone-800">
                          {order.specialInstructions}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-5 grid gap-2">
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--china-red)] px-4 py-2 font-black text-white transition hover:bg-[var(--dark-red)]"
                        onClick={() => handlePrint(order)}
                        type="button"
                      >
                        <Printer size={18} />
                        Print Receipt
                      </button>
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--warm-border)] bg-white px-4 py-2 font-black text-stone-900 transition hover:bg-[var(--jade-green)]"
                        onClick={() => handlePrint(order)}
                        type="button"
                      >
                        <RefreshCw size={18} />
                        Reprint
                      </button>
                    </div>
                  </div>
                </div>
                    </>
                  );
                })()}
              </article>
            ))}
          </div>
        ) : (
          <section className="paper-card p-8 text-center">
            <h2 className="text-2xl font-black text-[var(--deep-bamboo)]">
              No orders yet
            </h2>
            <p className="mt-2 text-base font-semibold text-stone-700">
              Submit a test order from the customer checkout page to see it here.
            </p>
          </section>
        )}
      </div>

      <ReceiptPrintView order={printOrder} />
    </>
  );
}

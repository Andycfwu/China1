"use client";

import Link from "next/link";
import {
  ChevronDown,
  Flame,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { PriceDisplay } from "@/components/PriceDisplay";
import {
  createCartModifier,
  getModifierGroupsForSection,
  isLunchSpecialSection,
  isSpecialtyPlatterSection,
} from "@/lib/menu-modifiers";
import type { CartItemModifier } from "@/lib/menu-modifiers";
import { restaurantInfo } from "@/lib/menu-data";
import type {
  MenuItem as MenuItemType,
  MenuSection as MenuSectionType,
} from "@/lib/menu-data";
import {
  fetchOnlineOrderingOpen,
  subscribeToOrderChanges,
} from "@/lib/order-store";
import {
  getUnavailableLunchCartItems,
  isItemCurrentlyAvailable,
  isLunchCartItem,
  isLunchSection,
  isLunchSpecialAvailable,
  LUNCH_CHECKOUT_BLOCK_MESSAGE,
  LUNCH_SPECIAL_HOURS_MESSAGE,
  LUNCH_SPECIAL_UNAVAILABLE_MESSAGE,
} from "@/lib/order-availability";
import {
  formatCurrency,
  parsePriceOptions,
  type PriceOption,
} from "@/lib/pricing";

type OrderMenuProps = {
  sections: MenuSectionType[];
};

function itemSearchText(item: MenuItemType) {
  return `${item.id} ${item.name} ${item.price} ${
    item.description ?? ""
  }`.toLowerCase();
}

export function OrderMenu({ sections }: OrderMenuProps) {
  const cart = useCart();

  const [query, setQuery] = useState("");
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceByItemId, setSelectedPriceByItemId] = useState<
    Record<string, string>
  >({});
  const [selectedModifierByItemId, setSelectedModifierByItemId] = useState<
    Record<string, string>
  >({});
  const [cartOpen, setCartOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [onlineOrderingOpen, setOnlineOrderingOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => (sections[0] ? { [sections[0].id]: true } : {}),
  );

  const isFiltering = query.trim().length > 0 || spicyOnly;
  const unavailableLunchCartItems = useMemo(
    () => getUnavailableLunchCartItems(cart.items, now),
    [cart.items, now],
  );
  const hasUnavailableLunchCartItems = unavailableLunchCartItems.length > 0;

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sections
      .filter((section) =>
        selectedCategory === "all" ? true : section.id === selectedCategory,
      )
      .map((section) => {
        const items = section.items.filter((item) => {
          const haystack = itemSearchText(item);
          const matchesQuery =
            !normalizedQuery || haystack.includes(normalizedQuery);
          const matchesSpicy = !spicyOnly || Boolean(item.spicy);

          return matchesQuery && matchesSpicy;
        });

        return { ...section, items };
      })
      .filter((section) => section.items.length > 0);
  }, [sections, query, spicyOnly, selectedCategory]);

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

  function modifiersKey(modifiers: CartItemModifier[]) {
    return JSON.stringify(
      modifiers.map((modifier) => ({
        groupId: modifier.groupId,
        optionId: modifier.optionId,
      })),
    );
  }

  function getItemQuantity(
    item: MenuItemType,
    priceOption?: PriceOption,
    modifiers: CartItemModifier[] = [],
  ) {
    const selectedModifiersKey = modifiersKey(modifiers);

    return cart.items
      // Keep old cart lines usable if they predate size selection.
      .filter(
        (cartItem) =>
          cartItem.menuItemId === item.id && cartItem.name === item.name,
      )
      .filter((cartItem) =>
        priceOption
          ? (cartItem.selectedPriceId ?? "regular") === priceOption.id
          : true,
      )
      .filter((cartItem) => modifiersKey(cartItem.modifiers ?? []) === selectedModifiersKey)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
  }

  function toggleSection(sectionId: string) {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }

  function selectCategory(sectionId: string) {
    setSelectedCategory(sectionId);

    if (sectionId !== "all") {
      setOpenSections((current) => ({
        ...current,
        [sectionId]: true,
      }));
    }
  }

  function expandAll() {
    setOpenSections(
      Object.fromEntries(sections.map((section) => [section.id, true])),
    );
  }

  function collapseAll() {
    setOpenSections({});
  }

  function clearFilters() {
    setQuery("");
    setSpicyOnly(false);
    setSelectedCategory("all");
    setOpenSections(sections[0] ? { [sections[0].id]: true } : {});
  }

  const cartContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--warm-border)] pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-[var(--deep-bamboo)]">
            <ShoppingCart size={23} />
            Your Order
          </h2>
          <p className="mt-1 text-sm font-semibold text-stone-600">
            {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} ·{" "}
            {formatCurrency(cart.estimatedSubtotal)} est.
          </p>
        </div>

        <button
          aria-label="Close cart"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-stone-700 shadow-sm ring-1 ring-[var(--warm-border)]"
          onClick={() => setCartOpen(false)}
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      {cart.items.length > 0 ? (
        <>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4">
            {cart.items.map((item) => (
              <div
                className="min-w-0 rounded-xl border border-green-900/10 bg-white p-3 shadow-sm"
                key={item.cartId}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-black leading-5 text-stone-950">
                      {item.name}
                    </p>
                    {item.selectedPriceLabel &&
                    !["Regular", "Base"].includes(item.selectedPriceLabel) ? (
                      <p className="mt-1 text-xs font-black uppercase text-[var(--deep-bamboo)]">
                        Size: {item.selectedPriceLabel}
                      </p>
                    ) : null}
                    <p className="mt-1 break-words text-sm font-semibold text-stone-600">
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
                  </div>

                  <button
                    aria-label={`Remove ${item.name}`}
                    className="shrink-0 text-stone-500 hover:text-[var(--china-red)]"
                    onClick={() => cart.removeItem(item.cartId)}
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
                  <button
                    aria-label={`Decrease ${item.name}`}
                    className="grid size-9 place-items-center rounded-md border border-[var(--warm-border)] bg-white text-stone-900"
                    onClick={() =>
                      cart.updateQuantity(item.cartId, item.quantity - 1)
                    }
                    type="button"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-8 text-center font-black">
                    {item.quantity}
                  </span>

                  <button
                    aria-label={`Increase ${item.name}`}
                    className="grid size-9 place-items-center rounded-md border border-[var(--warm-border)] bg-white text-stone-900"
                    onClick={() =>
                      cart.updateQuantity(item.cartId, item.quantity + 1)
                    }
                    type="button"
                  >
                    <Plus size={16} />
                  </button>

                  <span className="ml-auto break-words text-right font-black text-[var(--china-red)]">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>

                <label className="mt-3 block">
                  <span className="text-xs font-black uppercase text-stone-500">
                    Item notes
                  </span>
                  <input
                    className="mt-1 min-h-10 w-full rounded-md border border-[var(--warm-border)] px-3 text-sm font-semibold outline-none focus:border-[var(--deep-bamboo)]"
                    onChange={(event) =>
                      cart.updateNotes(item.cartId, event.target.value)
                    }
                    placeholder="No onions, sauce on side..."
                    value={item.notes}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--warm-border)] pt-4">
            <div className="flex justify-between text-lg font-black">
              <span>Estimated subtotal</span>
              <span>{formatCurrency(cart.estimatedSubtotal)}</span>
            </div>

            <p className="mt-2 text-xs font-semibold leading-5 text-stone-600">
              Prices are estimated and may change at the restaurant. Payment is
              cash or Cash App at pickup.
            </p>

            {onlineOrderingOpen && !hasUnavailableLunchCartItems ? (
              <Link
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--china-red)] px-4 py-3 text-base font-black text-white transition hover:bg-[var(--dark-red)]"
                href="/checkout"
                onClick={() => setCartOpen(false)}
              >
                Checkout
              </Link>
            ) : !onlineOrderingOpen ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-black leading-6 text-[var(--china-red)]">
                Online ordering is currently closed. Please call the restaurant
                to order.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-black leading-6 text-[var(--china-red)]">
                {LUNCH_CHECKOUT_BLOCK_MESSAGE}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-8">
          <p className="text-base font-semibold leading-7 text-stone-700">
            Add menu items to start a pickup order. Payment is cash or Cash App
            at pickup.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="grid max-w-full min-w-0 gap-6 overflow-x-hidden lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        {/* Desktop category sidebar */}
        <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] min-w-0 overflow-y-auto rounded-2xl border border-[var(--warm-border)] bg-[var(--cream-paper)] p-3 shadow-lg shadow-green-950/5 lg:block">
          <nav className="space-y-2">
            <button
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-black transition ${
                selectedCategory === "all"
                  ? "bg-[var(--deep-bamboo)] text-white"
                  : "bg-white text-[var(--deep-bamboo)] hover:bg-green-50"
              }`}
              onClick={() => selectCategory("all")}
              type="button"
            >
              All Categories
            </button>

            {sections.map((section) => (
              <button
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-black transition ${
                  selectedCategory === section.id
                    ? "bg-[var(--deep-bamboo)] text-white"
                    : "bg-white text-[var(--deep-bamboo)] hover:bg-green-50"
                }`}
                key={section.id}
                onClick={() => selectCategory(section.id)}
                type="button"
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          {/* Normal-flow controls card. Not sticky, so it cannot cover Lunch Special. */}
          <div className="mb-8 min-w-0 rounded-2xl border border-[var(--warm-border)] bg-[#fff8e8]/95 p-4 shadow-xl">
            {!onlineOrderingOpen ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[var(--china-red)]">
                <p className="font-black">
                  Online ordering is currently closed.
                </p>
                <p className="mt-1 text-sm font-semibold leading-6">
                  Please call the restaurant to order.
                </p>
                <a
                  className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--china-red)] px-4 py-2 text-sm font-black text-white"
                  href={`tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`}
                >
                  Call {restaurantInfo.primaryPhone}
                </a>
              </div>
            ) : null}

            <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <label className="relative block min-w-0">
                <span className="sr-only">Search menu</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                  size={22}
                />
                <input
                  className="min-h-14 w-full min-w-0 rounded-md border border-[var(--warm-border)] bg-white py-3 pl-12 pr-4 text-base font-semibold text-stone-950 outline-none transition placeholder:text-stone-500 focus:border-[var(--deep-bamboo)] focus:ring-4 focus:ring-green-100"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search dishes, item numbers, or prices"
                  type="search"
                  value={query}
                />
              </label>

              <button
                className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-black transition ${
                  spicyOnly
                    ? "bg-[var(--china-red)] text-white"
                    : "bg-white text-[var(--china-red)] ring-1 ring-red-200"
                }`}
                onClick={() => setSpicyOnly((value) => !value)}
                type="button"
              >
                <Flame aria-hidden="true" fill="currentColor" size={20} />
                Hot & Spicy
              </button>

              <button
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[var(--deep-bamboo)] px-4 py-3 text-base font-black text-white transition hover:bg-[var(--dark-forest)]"
                onClick={() => setCartOpen(true)}
                type="button"
              >
                <ShoppingCart size={22} />
                {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
                <span>{formatCurrency(cart.estimatedSubtotal)}</span>
              </button>
            </div>

            <label className="mt-3 block lg:hidden">
              <span className="text-sm font-black text-[var(--deep-bamboo)]">
                Category
              </span>
              <select
                className="mt-2 min-h-12 w-full rounded-xl border border-[var(--warm-border)] bg-white px-4 py-3 text-base font-black text-black outline-none focus:border-[var(--deep-bamboo)]"
                onChange={(event) => selectCategory(event.target.value)}
                value={selectedCategory}
              >
                <option value="all">All Categories</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-md border border-[var(--warm-border)] bg-white px-4 py-2 text-sm font-black text-[var(--deep-bamboo)] hover:bg-green-50"
                onClick={expandAll}
                type="button"
              >
                Expand all
              </button>
              <button
                className="rounded-md border border-[var(--warm-border)] bg-white px-4 py-2 text-sm font-black text-[var(--deep-bamboo)] hover:bg-green-50"
                onClick={collapseAll}
                type="button"
              >
                Collapse all
              </button>
            </div>

            <p className="mt-3 text-sm font-semibold text-stone-600">
              Online ordering is pickup only. Estimated prices are shown for
              review and may change at the restaurant.
            </p>
          </div>

          {visibleSections.length > 0 ? (
            <div className="grid min-w-0 gap-5 pt-2">
              {visibleSections.map((section) => {
                const isOpen = openSections[section.id] || isFiltering;
                const lunchSection = isLunchSection(section);
                const lunchAvailable =
                  !lunchSection || isLunchSpecialAvailable(now);

                return (
                  <section
                    className="min-w-0 scroll-mt-32 rounded-2xl border border-[var(--warm-border)] bg-[var(--cream-paper)] p-3 shadow-lg shadow-green-950/5 sm:p-5"
                    id={`section-${section.id}`}
                    key={section.id}
                  >
                    <button
                      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-[var(--warm-border)] bg-[#fff8e8] px-4 py-3 text-left transition hover:bg-white"
                      onClick={() => toggleSection(section.id)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block break-words text-2xl font-black tracking-normal text-[var(--deep-bamboo)] sm:text-3xl">
                          {section.title}
                        </span>
                        <span className="mt-1 block text-sm font-black text-stone-600">
                          {section.items.length} items
                        </span>
                      </span>

                      <ChevronDown
                        className={`shrink-0 text-[var(--deep-bamboo)] transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        size={26}
                      />
                    </button>

                    {lunchSection ? (
                      <div
                        className={`mt-4 rounded-xl border p-3 text-sm font-black leading-6 ${
                          lunchAvailable
                            ? "border-green-200 bg-green-50 text-[var(--deep-bamboo)]"
                            : "border-red-200 bg-red-50 text-[var(--china-red)]"
                        }`}
                      >
                        <p>{LUNCH_SPECIAL_HOURS_MESSAGE}</p>
                        {!lunchAvailable ? (
                          <p className="mt-1">
                            {LUNCH_SPECIAL_UNAVAILABLE_MESSAGE}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {isOpen ? (
                      <>
                        {section.note ? (
                          <p className="mt-4 text-sm font-semibold leading-6 text-stone-700 sm:text-base">
                            {section.note}
                          </p>
                        ) : null}

                        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3">
                          {section.items.map((item) => {
                            const rawPriceOptions = parsePriceOptions(item.price);
                            const specialtyPlatter =
                              isSpecialtyPlatterSection(section);
                            const lunchSpecial = isLunchSpecialSection(section);
                            const priceOptions = specialtyPlatter
                              ? [
                                  {
                                    ...rawPriceOptions[0],
                                    id: "base",
                                    label: "Base",
                                  },
                                ]
                              : rawPriceOptions;
                            const modifierGroups = getModifierGroupsForSection(section);
                            const modifierGroup = modifierGroups[0];
                            const selectedModifierOptionId =
                              selectedModifierByItemId[item.id];
                            const selectedModifierOption =
                              modifierGroup?.options.find(
                                (option) =>
                                  option.id === selectedModifierOptionId,
                              );
                            const selectedModifiers =
                              modifierGroup && selectedModifierOption
                                ? [
                                    createCartModifier(
                                      modifierGroup,
                                      selectedModifierOption,
                                    ),
                                  ]
                                : [];
                            const hasMultiplePrices = priceOptions.length > 1;
                            const selectedPriceId =
                              selectedPriceByItemId[item.id] ??
                              priceOptions[0]?.id;
                            const selectedPriceOption =
                              priceOptions.find(
                                (option) => option.id === selectedPriceId,
                              ) ?? priceOptions[0];
                            const quantityInCart = getItemQuantity(
                              item,
                              selectedPriceOption,
                              selectedModifiers,
                            );
                            const itemAvailable = isItemCurrentlyAvailable(
                              item,
                              section,
                              now,
                            );
                            const canAddItem =
                              onlineOrderingOpen && itemAvailable;
                            const modifierDeltaCents = selectedModifiers.reduce(
                              (total, modifier) =>
                                total + modifier.priceDeltaCents,
                              0,
                            );
                            const selectedItemTotal =
                              selectedPriceOption &&
                              (selectedPriceOption.unitPriceCents +
                                modifierDeltaCents) /
                                100;

                            return (
                              <article
                                className="min-w-0 rounded-2xl border border-green-900/10 bg-white p-4 shadow-sm"
                                key={`${section.id}-${item.id}-${item.name}`}
                              >
                                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-md bg-[var(--jade-green)] px-2 py-1 text-xs font-black text-[var(--deep-bamboo)]">
                                        {item.id}
                                      </span>

                                      {item.spicy ? (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-black text-[var(--china-red)]">
                                          <Flame
                                            aria-hidden="true"
                                            fill="currentColor"
                                            size={14}
                                          />
                                          Hot & Spicy
                                        </span>
                                      ) : null}
                                    </div>

                                    <h3 className="mt-3 whitespace-normal break-words text-lg font-black leading-tight text-stone-950">
                                      {item.name}
                                    </h3>

                                    {item.description ? (
                                      <p className="mt-1 text-sm font-semibold leading-5 text-stone-700">
                                        {item.description}
                                      </p>
                                    ) : null}

                                    {modifierGroup ? (
                                      <div className="mt-4">
                                        <label className="block">
                                          <span className="text-sm font-black text-[var(--deep-bamboo)]">
                                            {lunchSpecial
                                              ? "Side upgrade"
                                              : "Add a side?"}
                                          </span>
                                          <select
                                            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--warm-border)] bg-white px-3 py-2 text-sm font-black text-stone-950 outline-none focus:border-[var(--deep-bamboo)]"
                                            onChange={(event) =>
                                              setSelectedModifierByItemId(
                                                (current) => ({
                                                  ...current,
                                                  [item.id]: event.target.value,
                                                }),
                                              )
                                            }
                                            value={selectedModifierOptionId ?? ""}
                                          >
                                            <option value="">
                                              {lunchSpecial
                                                ? "Included side + can soda"
                                                : "No side"}
                                            </option>
                                            {modifierGroup.options.map(
                                              (option) => (
                                                <option
                                                  key={option.id}
                                                  value={option.id}
                                                >
                                                  {option.label} +
                                                  {formatCurrency(
                                                    option.priceDeltaCents / 100,
                                                  )}
                                                </option>
                                              ),
                                            )}
                                          </select>
                                        </label>
                                        {lunchSpecial ? (
                                          <p className="mt-2 text-xs font-black uppercase text-stone-600">
                                            Includes can soda
                                          </p>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="min-w-0 lg:text-right">
                                    {hasMultiplePrices ? (
                                      <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {priceOptions.map((option) => {
                                          const selected =
                                            selectedPriceOption?.id ===
                                            option.id;

                                          return (
                                            <button
                                              className={`rounded-full border px-3 py-2 text-sm font-black transition ${
                                                selected
                                                  ? "border-[var(--deep-bamboo)] bg-[var(--deep-bamboo)] text-white"
                                                  : "border-green-900/20 bg-white text-[var(--deep-bamboo)] hover:bg-green-50"
                                              }`}
                                              disabled={!itemAvailable}
                                              key={option.id}
                                              onClick={() =>
                                                setSelectedPriceByItemId(
                                                  (current) => ({
                                                    ...current,
                                                    [item.id]: option.id,
                                                  }),
                                                )
                                              }
                                              type="button"
                                            >
                                              {option.label} {option.price}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <PriceDisplay
                                        align="right"
                                        price={selectedPriceOption?.price ?? item.price}
                                      />
                                    )}

                                    {selectedModifiers.length > 0 &&
                                    selectedPriceOption ? (
                                      <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-black leading-6 text-stone-800 lg:text-right">
                                        <p>
                                          Base:{" "}
                                          {formatCurrency(
                                            selectedPriceOption.unitPriceCents /
                                              100,
                                          )}
                                        </p>
                                        <p>
                                          Side:{" "}
                                          {selectedModifiers[0].optionLabel} +
                                          {formatCurrency(
                                            selectedModifiers[0]
                                              .priceDeltaCents / 100,
                                          )}
                                        </p>
                                        <p className="text-[var(--china-red)]">
                                          Item total:{" "}
                                          {formatCurrency(selectedItemTotal)}
                                        </p>
                                      </div>
                                    ) : null}

                                    <button
                                      className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--deep-bamboo)] px-4 py-3 text-base font-black text-white transition hover:bg-[var(--dark-forest)] disabled:cursor-not-allowed disabled:bg-stone-400 lg:min-h-11 lg:rounded-md lg:px-3 lg:py-2 lg:text-sm"
                                      disabled={!canAddItem}
                                      onClick={() => {
                                        if (canAddItem && selectedPriceOption) {
                                          cart.addItem(
                                            item,
                                            selectedPriceOption,
                                            selectedModifiers,
                                          );
                                        }
                                      }}
                                      type="button"
                                    >
                                      <Plus size={16} />
                                      {!onlineOrderingOpen
                                        ? "Ordering Closed"
                                        : !itemAvailable
                                          ? "Lunch Unavailable"
                                        : quantityInCart > 0
                                          ? `Add More (${quantityInCart} in cart)`
                                          : hasMultiplePrices && selectedPriceOption
                                            ? `Add ${selectedPriceOption.label} to Order`
                                            : "Add to Order"}
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--warm-border)] bg-[var(--cream-paper)] p-6 text-center shadow-lg shadow-green-950/5">
              <p className="text-xl font-black text-[var(--deep-bamboo)]">
                No matching items found.
              </p>
              <p className="mt-2 font-semibold text-stone-700">
                Try another category or search.
              </p>
              <button
                className="mt-4 rounded-md bg-[var(--deep-bamboo)] px-4 py-3 font-black text-white"
                onClick={clearFilters}
                type="button"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart drawer / mobile sheet */}
      {cartOpen ? (
        <div className="fixed inset-0 z-[80]">
          <button
            aria-label="Close cart"
            className="absolute inset-0 bg-black/45"
            onClick={() => setCartOpen(false)}
            type="button"
          />

          <aside className="absolute bottom-0 right-0 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#fff8e8] p-4 shadow-2xl lg:bottom-0 lg:top-0 lg:max-h-none lg:w-[430px] lg:rounded-l-3xl lg:rounded-tr-none">
            {cartContent}
          </aside>
        </div>
      ) : null}

      {/* Mobile sticky cart */}
      {cart.itemCount > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-green-900/10 bg-[#fff8e8]/95 p-3 shadow-2xl shadow-green-950/20 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-stone-950">
                {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
              </p>
              <p className="text-xs font-semibold text-stone-600">
                {formatCurrency(cart.estimatedSubtotal)} est.
              </p>
            </div>

            <button
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[var(--deep-bamboo)] px-5 py-3 text-sm font-black text-white"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              View Order
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MenuItem } from "@/lib/menu-data";
import type { CartItemModifier } from "@/lib/menu-modifiers";
import { CART_STORAGE_KEY } from "@/lib/order-store";
import type { CartItem } from "@/lib/order-types";
import {
  estimateUnitPrice,
  parsePriceOptions,
  type PriceOption,
} from "@/lib/pricing";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  estimatedSubtotal: number;
  addItem: (
    item: MenuItem,
    priceOption?: PriceOption,
    modifiers?: CartItemModifier[],
  ) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  updateNotes: (cartId: string, notes: string) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function createCartId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Could not save cart to localStorage", error);
    }
  }, [items]);

  const addItem = useCallback((
    item: MenuItem,
    priceOption?: PriceOption,
    modifiers: CartItemModifier[] = [],
  ) => {
    setItems((currentItems) => {
      const selectedOption = priceOption ?? parsePriceOptions(item.price)[0];
      const selectedPriceId = selectedOption?.id ?? "regular";
      const selectedPriceLabel = selectedOption?.label ?? "Regular";
      const selectedPrice = selectedOption?.price ?? item.price;
      const modifierKey = JSON.stringify(
        modifiers.map((modifier) => ({
          groupId: modifier.groupId,
          optionId: modifier.optionId,
        })),
      );
      const existingItem = currentItems.find(
        (cartItem) =>
          cartItem.menuItemId === item.id &&
          cartItem.name === item.name &&
          (cartItem.selectedPriceId ?? "regular") === selectedPriceId &&
          JSON.stringify(
            (cartItem.modifiers ?? []).map((modifier) => ({
              groupId: modifier.groupId,
              optionId: modifier.optionId,
            })),
          ) === modifierKey &&
          cartItem.notes.length === 0,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.cartId === existingItem.cartId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      const cartItem: CartItem = {
        cartId: createCartId(),
        menuItemId: item.id,
        modifiers,
        name: item.name,
        notes: "",
        price: selectedPrice,
        quantity: 1,
        selectedPrice,
        selectedPriceId,
        selectedPriceLabel,
        spicy: item.spicy,
        unitPrice:
          selectedOption && selectedOption.unitPriceCents > 0
            ? (selectedOption.unitPriceCents +
                modifiers.reduce(
                  (total, modifier) => total + modifier.priceDeltaCents,
                  0,
                )) /
              100
            : estimateUnitPrice(item.price),
      };

      return [...currentItems, cartItem];
    });
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const updateNotes = useCallback((cartId: string, notes: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartId === cartId ? { ...item, notes } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.cartId !== cartId),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const estimatedSubtotal = items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );

    return {
      addItem,
      clearCart,
      estimatedSubtotal,
      itemCount,
      items,
      removeItem,
      updateNotes,
      updateQuantity,
    };
  }, [addItem, clearCart, items, removeItem, updateNotes, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

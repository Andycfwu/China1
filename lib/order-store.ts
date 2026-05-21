import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import type { CartItem, OrderStatus, StoredOrder } from "@/lib/order-types";

export const CART_STORAGE_KEY = "china1-cart-v1";
export const ONLINE_ORDERING_SETTING_KEY = "online_ordering_open";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  pickup_type: StoredOrder["pickupChoice"];
  pickup_time: string;
  payment_method: StoredOrder["paymentMethod"];
  special_instructions: string | null;
  subtotal_cents: number;
  status: OrderStatus;
  printed: boolean;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
};

type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_number: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
  notes: string | null;
  spicy: boolean;
  created_at: string;
};

type RestaurantSettingRow = {
  key: string;
  value: { open?: boolean } | boolean | null;
  updated_at: string;
};

export class OrderStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderStoreError";
  }
}

export { isSupabaseConfigured };

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new OrderStoreError(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  return supabase;
}

function centsToDollars(cents: number) {
  return cents / 100;
}

export function dollarsToCents(amount: number) {
  return Math.round(amount * 100);
}

function mapItemRow(row: OrderItemRow): CartItem {
  return {
    cartId: row.id,
    menuItemId: row.menu_item_id,
    name: row.name,
    notes: row.notes ?? "",
    price: `$${centsToDollars(row.unit_price_cents).toFixed(2)}`,
    quantity: row.quantity,
    spicy: row.spicy,
    unitPrice: centsToDollars(row.unit_price_cents),
  };
}

export function mapOrderRow(row: OrderRow): StoredOrder {
  return {
    createdAt: row.created_at,
    customerName: row.customer_name,
    estimatedSubtotal: centsToDollars(row.subtotal_cents),
    id: row.id,
    items: row.order_items?.map(mapItemRow) ?? [],
    orderNumber: row.order_number,
    paymentMethod: row.payment_method,
    phone: row.customer_phone,
    pickupChoice: row.pickup_type,
    pickupTime: row.pickup_time,
    printed: row.printed,
    specialInstructions: row.special_instructions ?? "",
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function createStoredOrder(
  order: Omit<StoredOrder, "createdAt" | "id" | "printed" | "status" | "updatedAt">,
) {
  const client = requireSupabase();

  const { data: orderRow, error: orderError } = await client
    .from("orders")
    .insert({
      customer_name: order.customerName,
      customer_phone: order.phone,
      order_number: order.orderNumber,
      payment_method: order.paymentMethod,
      pickup_time: order.pickupTime,
      pickup_type: order.pickupChoice,
      printed: false,
      special_instructions: order.specialInstructions || null,
      status: "New",
      subtotal_cents: dollarsToCents(order.estimatedSubtotal),
    })
    .select()
    .single<OrderRow>();

  if (orderError || !orderRow) {
    throw new OrderStoreError(orderError?.message ?? "Could not create order.");
  }

  const orderItems = order.items.map((item) => ({
    menu_item_id: item.menuItemId,
    menu_item_number: item.menuItemId,
    name: item.name,
    notes: item.notes || null,
    order_id: orderRow.id,
    quantity: item.quantity,
    spicy: Boolean(item.spicy),
    unit_price_cents: dollarsToCents(item.unitPrice),
  }));

  const { error: itemsError } = await client.from("order_items").insert(orderItems);

  if (itemsError) {
    throw new OrderStoreError(itemsError.message);
  }

  const createdOrder = await fetchStoredOrder(orderRow.id);

  if (!createdOrder) {
    throw new OrderStoreError("Order was created, but could not be loaded.");
  }

  return createdOrder;
}

export async function fetchStoredOrder(id: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single<OrderRow>();

  if (error || !data) {
    return null;
  }

  return mapOrderRow(data);
}

export async function fetchStoredOrders() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  if (error) {
    throw new OrderStoreError(error.message);
  }

  return data.map(mapOrderRow);
}

export async function updateStoredOrderStatus(id: string, status: OrderStatus) {
  const client = requireSupabase();
  const { error } = await client
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new OrderStoreError(error.message);
  }
}

export async function markStoredOrderPrinted(id: string) {
  const client = requireSupabase();
  const { error } = await client
    .from("orders")
    .update({ printed: true })
    .eq("id", id);

  if (error) {
    throw new OrderStoreError(error.message);
  }
}

function parseOnlineOrderingOpen(row: RestaurantSettingRow | null) {
  if (!row) {
    return true;
  }

  if (typeof row.value === "boolean") {
    return row.value;
  }

  return row.value?.open !== false;
}

export async function fetchOnlineOrderingOpen() {
  if (!supabase || !isSupabaseConfigured) {
    return true;
  }

  const { data, error } = await supabase
    .from("restaurant_settings")
    .select("key, value, updated_at")
    .eq("key", ONLINE_ORDERING_SETTING_KEY)
    .maybeSingle<RestaurantSettingRow>();

  if (error) {
    throw new OrderStoreError(error.message);
  }

  return parseOnlineOrderingOpen(data);
}

export async function updateOnlineOrderingOpen(open: boolean) {
  const client = requireSupabase();
  const { error } = await client.from("restaurant_settings").upsert({
    key: ONLINE_ORDERING_SETTING_KEY,
    value: { open },
  });

  if (error) {
    throw new OrderStoreError(error.message);
  }
}

export function subscribeToOrderChanges(onChange: () => void) {
  if (!supabase || !isSupabaseConfigured) {
    return () => {};
  }

  const client = supabase;
  const channel = client
    .channel("admin-orders")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "order_items" },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "restaurant_settings" },
      onChange,
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

// Future print bridge TODO:
// A local restaurant computer should run a small service that watches new
// Supabase orders, formats the same browser receipt content as ESC/POS
// commands, sends it to PRINTER_HOST=192.168.1.131 on PRINTER_PORT=9100,
// marks the order printed=true, and supports manual reprint requests.

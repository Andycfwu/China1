import { NextResponse } from "next/server";
import {
  createCartModifier,
  isSpecialtyPlatterSection,
  SPECIALTY_PLATTER_SIDE_GROUP,
} from "@/lib/menu-modifiers";
import {
  findMenuItemWithSection,
  isLunchSection,
  isLunchSpecialAvailable,
  LUNCH_SPECIAL_HOURS_MESSAGE,
} from "@/lib/order-availability";
import type { PaymentMethod, PickupTimeChoice } from "@/lib/order-types";
import { calculateOrderTotalCents, parsePriceOptions } from "@/lib/pricing";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const ONLINE_ORDERING_SETTING_KEY = "online_ordering_open";

type OrderRequestItem = {
  menuItemId?: unknown;
  modifiers?: unknown;
  quantity?: unknown;
  notes?: unknown;
  selectedPriceId?: unknown;
};

type OrderRequestBody = {
  customerName?: unknown;
  customerPhone?: unknown;
  pickupType?: unknown;
  pickupTime?: unknown;
  paymentMethod?: unknown;
  specialInstructions?: unknown;
  items?: unknown;
};

type RestaurantSettingRow = {
  value: { open?: boolean } | boolean | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateSpecialtyPlatterModifiers(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length === 0) {
    return [];
  }

  if (value.length !== 1) {
    return null;
  }

  const modifier = value[0] as { groupId?: unknown; optionId?: unknown };
  const groupId = asTrimmedString(modifier.groupId);
  const optionId = asTrimmedString(modifier.optionId);

  if (groupId !== SPECIALTY_PLATTER_SIDE_GROUP.id) {
    return null;
  }

  const option = SPECIALTY_PLATTER_SIDE_GROUP.options.find(
    (sideOption) => sideOption.id === optionId,
  );

  return option
    ? [createCartModifier(SPECIALTY_PLATTER_SIDE_GROUP, option)]
    : null;
}

function createOrderNumber() {
  return `C1-${Date.now().toString().slice(-6)}`;
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return /^[\d\s\-().]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
}

export async function POST(request: Request) {
  let body: OrderRequestBody;

  try {
    body = (await request.json()) as OrderRequestBody;
  } catch {
    return jsonError("Invalid order request.", 400);
  }

  const supabase = createSupabaseServerClient();
  const { data: settingRow, error: settingError } = await supabase
    .from("restaurant_settings")
    .select("value")
    .eq("key", ONLINE_ORDERING_SETTING_KEY)
    .maybeSingle<RestaurantSettingRow>();

  if (settingError) {
    return jsonError("Could not validate online ordering status.", 500);
  }

  if (!parseOnlineOrderingOpen(settingRow)) {
    return jsonError(
      "Online ordering is currently closed. Please call the restaurant to order.",
      403,
    );
  }

  const customerName = asTrimmedString(body.customerName);
  const customerPhone = asTrimmedString(body.customerPhone);
  const pickupType = body.pickupType;
  const pickupTime = asTrimmedString(body.pickupTime);
  const paymentMethod = body.paymentMethod;
  const specialInstructions = asTrimmedString(body.specialInstructions);

  if (customerName.length < 2 || customerName.length > 80) {
    return jsonError("Customer name is required.", 400);
  }

  if (!customerPhone || !validatePhone(customerPhone)) {
    return jsonError("A valid phone number is required.", 400);
  }

  if (paymentMethod !== "Cash" && paymentMethod !== "Cash App") {
    return jsonError("Payment method must be Cash or Cash App.", 400);
  }

  if (pickupType !== "ASAP" && pickupType !== "Later") {
    return jsonError("Pickup time must be ASAP or scheduled for later.", 400);
  }

  if (pickupType === "Later" && !pickupTime) {
    return jsonError("Please choose a scheduled pickup time.", 400);
  }

  if (specialInstructions.length > 500) {
    return jsonError("Special instructions must be 500 characters or fewer.", 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonError("Cart must not be empty.", 400);
  }

  if (body.items.length > 100) {
    return jsonError("This order has too many line items.", 400);
  }

  const lunchAvailable = isLunchSpecialAvailable(new Date());
  const validatedItems = [];
  let subtotalCents = 0;

  for (const rawItem of body.items as OrderRequestItem[]) {
    if (!rawItem || typeof rawItem !== "object") {
      return jsonError("Invalid cart item.", 400);
    }

    const menuItemId = asTrimmedString(rawItem.menuItemId);
    const quantity = Number(rawItem.quantity);
    const notes = asTrimmedString(rawItem.notes);
    const selectedPriceId = asTrimmedString(rawItem.selectedPriceId);
    const menuMatch = findMenuItemWithSection(menuItemId);

    if (!menuMatch) {
      return jsonError("One or more menu items are no longer available.", 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return jsonError("Item quantities must be between 1 and 99.", 400);
    }

    if (notes.length > 200) {
      return jsonError("Item notes must be 200 characters or fewer.", 400);
    }

    if (isLunchSection(menuMatch.section) && !lunchAvailable) {
      return jsonError(
        `Lunch specials are only available ${LUNCH_SPECIAL_HOURS_MESSAGE
          .replace("Lunch specials are available ", "")
          .replace(".", "")}.`,
        400,
      );
    }

    const itemModifiers = isSpecialtyPlatterSection(menuMatch.section)
      ? validateSpecialtyPlatterModifiers(rawItem.modifiers)
      : [];

    if (!itemModifiers) {
      return jsonError(
        `Please choose no side or one valid side for ${menuMatch.item.name}.`,
        400,
      );
    }

    if (!isSpecialtyPlatterSection(menuMatch.section)) {
      const modifiers = Array.isArray(rawItem.modifiers)
        ? rawItem.modifiers
        : [];

      if (modifiers.length > 0) {
        return jsonError("Modifiers are not available for this item.", 400);
      }
    }

    const specialtyPlatter = isSpecialtyPlatterSection(menuMatch.section);
    const rawPriceOptions = parsePriceOptions(menuMatch.item.price);
    const priceOptions = specialtyPlatter
      ? [
          {
            ...rawPriceOptions[0],
            id: "base",
            label: "Base",
          },
        ]
      : rawPriceOptions;
    const selectedPriceOption =
      priceOptions.length === 1 || specialtyPlatter
        ? priceOptions[0]
        : priceOptions.find((option) => option.id === selectedPriceId);

    if (!selectedPriceOption || (priceOptions.length > 1 && !selectedPriceId)) {
      return jsonError(`Please choose a size for ${menuMatch.item.name}.`, 400);
    }

    const unitPriceCents = selectedPriceOption.unitPriceCents;
    const modifierDeltaCents = itemModifiers.reduce(
      (total, modifier) => total + modifier.priceDeltaCents,
      0,
    );
    const finalUnitPriceCents = unitPriceCents + modifierDeltaCents;

    if (finalUnitPriceCents <= 0) {
      return jsonError(
        `Could not validate the price for ${menuMatch.item.name}. Please call the restaurant.`,
        400,
      );
    }

    subtotalCents += finalUnitPriceCents * quantity;
    validatedItems.push({
      menuItemId,
      modifiers: itemModifiers,
      name: menuMatch.item.name,
      notes,
      price: selectedPriceOption.price,
      quantity,
      selectedPrice: selectedPriceOption.price,
      selectedPriceId: selectedPriceOption.id,
      selectedPriceLabel: selectedPriceOption.label,
      spicy: Boolean(menuMatch.item.spicy),
      unitPriceCents: finalUnitPriceCents,
    });
  }

  const totals = calculateOrderTotalCents(subtotalCents);
  const orderNumber = createOrderNumber();
  const normalizedPickupType = pickupType as PickupTimeChoice;
  const normalizedPaymentMethod = paymentMethod as PaymentMethod;

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      order_number: orderNumber,
      payment_method: normalizedPaymentMethod,
      pickup_time: normalizedPickupType === "ASAP" ? "ASAP" : pickupTime,
      pickup_type: normalizedPickupType,
      printed: false,
      special_instructions: specialInstructions || null,
      status: "New",
      subtotal_cents: totals.subtotalCents,
    })
    .select("id, created_at, updated_at")
    .single<{ id: string; created_at: string; updated_at: string }>();

  if (orderError || !orderRow) {
    return jsonError(orderError?.message ?? "Could not create order.", 500);
  }

  const orderItems = validatedItems.map((item) => ({
    menu_item_id: item.menuItemId,
    menu_item_number: item.menuItemId,
    modifiers: item.modifiers,
    name: item.name,
    notes: item.notes || null,
    order_id: orderRow.id,
    quantity: item.quantity,
    selected_price: item.selectedPrice,
    selected_price_id: item.selectedPriceId,
    selected_price_label: item.selectedPriceLabel,
    spicy: item.spicy,
    unit_price_cents: item.unitPriceCents,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderRow.id);

    return jsonError(itemsError.message, 500);
  }

  return NextResponse.json({
    order: {
      createdAt: orderRow.created_at,
      customerName,
      estimatedSubtotal: totals.subtotalCents / 100,
      id: orderRow.id,
      items: validatedItems.map((item, index) => ({
        cartId: `${orderRow.id}-${index}`,
        menuItemId: item.menuItemId,
        modifiers: item.modifiers,
        name: item.name,
        notes: item.notes,
        price: item.price,
        quantity: item.quantity,
        selectedPrice: item.selectedPrice,
        selectedPriceId: item.selectedPriceId,
        selectedPriceLabel: item.selectedPriceLabel,
        spicy: item.spicy,
        unitPrice: item.unitPriceCents / 100,
      })),
      orderNumber,
      paymentMethod: normalizedPaymentMethod,
      phone: customerPhone,
      pickupChoice: normalizedPickupType,
      pickupTime: normalizedPickupType === "ASAP" ? "ASAP" : pickupTime,
      printed: false,
      specialInstructions,
      status: "New",
      updatedAt: orderRow.updated_at,
    },
    totals: {
      estimatedTotalCents: totals.totalCents,
      salesTaxCents: totals.salesTaxCents,
      subtotalCents: totals.subtotalCents,
    },
  });
}

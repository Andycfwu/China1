import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Socket } from "node:net";
import { pathToFileURL } from "node:url";
import { calculateOrderTotals } from "../lib/pricing.ts";

dotenv.config({ path: ".env.local" });
dotenv.config();

type PaymentMethod = "Cash" | "Cash App";
type PickupChoice = "ASAP" | "Later";

type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_number: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
  selected_price_id: string | null;
  selected_price_label: string | null;
  selected_price: string | null;
  modifiers:
    | {
        groupId: string;
        groupLabel: string;
        optionId: string;
        optionLabel: string;
        priceDeltaCents: number;
      }[]
    | null;
  notes: string | null;
  spicy: boolean;
  created_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  pickup_type: PickupChoice;
  pickup_time: string;
  payment_method: PaymentMethod;
  special_instructions: string | null;
  subtotal_cents: number;
  status: string;
  printed: boolean;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
};

export type PrintableOrder = {
  createdAt: string;
  customerName: string;
  id: string;
  items: {
    id: string;
    modifiers?: {
      groupId: string;
      groupLabel: string;
      optionId: string;
      optionLabel: string;
      priceDeltaCents: number;
    }[];
    name: string;
    notes: string;
    quantity: number;
    selectedPrice?: string;
    selectedPriceId?: string;
    selectedPriceLabel?: string;
    spicy: boolean;
    unitPrice: number;
  }[];
  orderNumber: string;
  paymentMethod: PaymentMethod;
  phone: string;
  pickupChoice: PickupChoice;
  pickupTime: string;
  specialInstructions: string;
  subtotal: number;
};

const DEFAULT_PRINTER_HOST = "192.168.1.131";
const DEFAULT_PRINTER_PORT = 9100;
const POLL_INTERVAL_MS = 10_000;
const RECEIPT_WIDTH = 42;
const processingOrderIds = new Set<string>();

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function printerHost() {
  return (
    process.env.PRINTER_HOST ??
    process.env.THERMAL_PRINTER_HOST ??
    DEFAULT_PRINTER_HOST
  );
}

function printerPort() {
  return Number(
    process.env.PRINTER_PORT ??
      process.env.THERMAL_PRINTER_PORT ??
      DEFAULT_PRINTER_PORT,
  );
}

function createServiceClient() {
  return createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
      },
    },
  );
}

function dollars(cents: number) {
  return cents / 100;
}

function money(amount: number) {
  return amount.toFixed(2);
}

function cleanText(value: string) {
  return value
    .replaceAll("’", "'")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function receiptDateTime(value: string) {
  const date = new Date(value);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${dateLabel}  ${timeLabel}`;
}

function pickupLabel(order: PrintableOrder) {
  return order.pickupChoice === "ASAP"
    ? "Online_Pickup ASAP"
    : `Online_Pickup ${order.pickupTime}`;
}

function rowToOrder(row: OrderRow): PrintableOrder {
  return {
    createdAt: row.created_at,
    customerName: row.customer_name,
    id: row.id,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      modifiers: item.modifiers ?? [],
      name: item.name,
      notes: item.notes ?? "",
      quantity: item.quantity,
      selectedPrice: item.selected_price ?? "",
      selectedPriceId: item.selected_price_id ?? "",
      selectedPriceLabel: item.selected_price_label ?? "",
      spicy: item.spicy,
      unitPrice: dollars(item.unit_price_cents),
    })),
    orderNumber: row.order_number,
    paymentMethod: row.payment_method,
    phone: row.customer_phone,
    pickupChoice: row.pickup_type,
    pickupTime: row.pickup_time,
    specialInstructions: row.special_instructions ?? "",
    subtotal: dollars(row.subtotal_cents),
  };
}

function line(left: string, right = "", width = RECEIPT_WIDTH) {
  const safeLeft = cleanText(left);
  const safeRight = cleanText(right);
  const available = width - safeRight.length - 1;

  if (!safeRight) {
    return wrapText(safeLeft, width).join("\n");
  }

  if (safeLeft.length <= available) {
    return `${safeLeft}${" ".repeat(width - safeLeft.length - safeRight.length)}${safeRight}`;
  }

  const wrapped = wrapText(safeLeft, available);
  const first = wrapped.shift() ?? "";
  return [
    `${first}${" ".repeat(width - first.length - safeRight.length)}${safeRight}`,
    ...wrapped,
  ].join("\n");
}

function wrapText(text: string, width = RECEIPT_WIDTH) {
  const words = cleanText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function text(value = "") {
  return Buffer.from(`${cleanText(value)}\n`, "utf8");
}

function command(...bytes: number[]) {
  return Buffer.from(bytes);
}

function align(mode: "left" | "center" | "right") {
  const value = mode === "left" ? 0 : mode === "center" ? 1 : 2;
  return command(0x1b, 0x61, value);
}

function bold(enabled: boolean) {
  return command(0x1b, 0x45, enabled ? 1 : 0);
}

function textSize(width: 0 | 1, height: 0 | 1) {
  return command(0x1d, 0x21, (width << 4) | height);
}

export function buildReceiptBuffer(order: PrintableOrder) {
  const totals = calculateOrderTotals(order.subtotal);
  const parts: Buffer[] = [];

  parts.push(command(0x1b, 0x40));
  parts.push(align("center"), bold(true), textSize(1, 1), text("CHINA 1"));
  parts.push(textSize(0, 0), bold(false));
  parts.push(text("450 S Broadway, Camden, NJ 08103"));
  parts.push(text("Tel:(856)432-6828"));
  parts.push(text(""));
  parts.push(textSize(1, 1), text("Online_Order / Pickup"), textSize(0, 0));
  parts.push(align("left"));
  parts.push(text(line(receiptDateTime(order.createdAt), order.orderNumber)));
  parts.push(text("Server: Online"));
  parts.push(text("-".repeat(RECEIPT_WIDTH)));
  parts.push(text(pickupLabel(order)));
  parts.push(text(`Pay at pickup: ${order.paymentMethod}`));
  parts.push(text(`Name: ${order.customerName}`));
  parts.push(text(`Phone: ${order.phone}`));
  parts.push(text("-".repeat(RECEIPT_WIDTH)));

  order.items.forEach((item, index) => {
    const itemLabel = `${index + 1}. ${item.quantity > 1 ? `${item.quantity}x ` : ""}${item.name}`;
    parts.push(bold(true), text(line(itemLabel, money(item.unitPrice * item.quantity))));
    parts.push(bold(false));

    if (item.spicy) {
      parts.push(text(`   [Hot & Spicy]`));
    }

    if (
      item.selectedPriceLabel &&
      !["Regular", "Base"].includes(item.selectedPriceLabel)
    ) {
      parts.push(text(`   [Size: ${item.selectedPriceLabel}]`));
    }

    item.modifiers?.forEach((modifier) => {
      parts.push(
        text(
          `   [${modifier.groupLabel}: ${modifier.optionLabel} +${money(
            modifier.priceDeltaCents / 100,
          )}]`,
        ),
      );
    });

    if (item.notes) {
      parts.push(text(`   [${item.notes}]`));
    }
  });

  if (order.specialInstructions) {
    parts.push(text("-".repeat(RECEIPT_WIDTH)));
    parts.push(text(`   [${order.specialInstructions}]`));
  }

  parts.push(text("-".repeat(RECEIPT_WIDTH)));
  parts.push(text(line("Subtotal:", money(totals.subtotal))));
  parts.push(text(line("Sales Tax:", money(totals.salesTax))));
  parts.push(bold(true), textSize(1, 1));
  parts.push(text(line("Estimated Total:", money(totals.total), 24)));
  parts.push(textSize(0, 0), bold(false));
  parts.push(text("-".repeat(RECEIPT_WIDTH)));
  parts.push(align("center"));
  parts.push(text("Prices subject to change."));
  parts.push(text("Thank You"));
  parts.push(text("\n\n"));
  parts.push(command(0x1d, 0x56, 0x42, 0x00));

  return Buffer.concat(parts);
}

export function sendToPrinter(buffer: Buffer) {
  return new Promise<void>((resolve, reject) => {
    const socket = new Socket();
    let settled = false;

    function finish(error?: Error) {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }

    socket.setTimeout(8_000);
    socket.once("error", finish);
    socket.once("timeout", () => finish(new Error("Printer connection timed out.")));
    socket.connect(printerPort(), printerHost(), () => {
      socket.write(buffer, (error) => {
        if (error) {
          finish(error);
          return;
        }

        socket.end();
      });
    });
    socket.once("close", (hadError) => {
      if (!hadError) {
        finish();
      }
    });
  });
}

async function fetchUnprintedOrders() {
  const client = createServiceClient();
  const { data, error } = await client
    .from("orders")
    .select("*, order_items(*)")
    .eq("printed", false)
    .order("created_at", { ascending: true })
    .returns<OrderRow[]>();

  if (error) {
    throw error;
  }

  return data.map(rowToOrder);
}

async function markPrinted(orderId: string) {
  const client = createServiceClient();
  const { error } = await client
    .from("orders")
    .update({ printed: true })
    .eq("id", orderId)
    .eq("printed", false);

  if (error) {
    throw error;
  }
}

async function printOrder(order: PrintableOrder) {
  if (processingOrderIds.has(order.id)) {
    return;
  }

  processingOrderIds.add(order.id);
  console.log(`[print-bridge] Printing ${order.orderNumber}...`);

  try {
    await sendToPrinter(buildReceiptBuffer(order));
    await markPrinted(order.id);
    console.log(`[print-bridge] Printed ${order.orderNumber} and marked printed=true.`);
  } catch (error) {
    console.error(
      `[print-bridge] Failed to print ${order.orderNumber}. It will remain printed=false.`,
      error,
    );
  } finally {
    processingOrderIds.delete(order.id);
  }
}

async function pollOnce() {
  const orders = await fetchUnprintedOrders();

  if (orders.length === 0) {
    return;
  }

  for (const order of orders) {
    await printOrder(order);
  }
}

export async function runPrintBridge() {
  console.log("[print-bridge] China 1 thermal print bridge starting.");
  console.log(`[print-bridge] Printer: ${printerHost()}:${printerPort()}`);
  console.log("[print-bridge] Run this on only one restaurant computer at a time.");

  await pollOnce();

  windowlessInterval(async () => {
    try {
      await pollOnce();
    } catch (error) {
      console.error("[print-bridge] Poll failed.", error);
    }
  }, POLL_INTERVAL_MS);
}

function windowlessInterval(callback: () => void, ms: number) {
  return setInterval(callback, ms);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  runPrintBridge().catch((error) => {
    console.error("[print-bridge] Fatal startup error.", error);
    process.exit(1);
  });
}

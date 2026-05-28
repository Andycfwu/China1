import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import iconv from "iconv-lite";
import { createServer, type Server } from "node:http";
import { Socket } from "node:net";
import { pathToFileURL } from "node:url";
import { calculateOrderTotals, isCashAppPayment } from "../lib/pricing.ts";
import {
  getReceiptChineseName,
  normalizeReceiptItemCode,
} from "../lib/receipt-chinese-names.ts";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

type PaymentMethod = string;
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
    menuItemId: string;
    menuItemNumber?: string;
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
const DEFAULT_HEALTH_PORT = 3101;
const POLL_INTERVAL_MS = 10_000;
const RECEIPT_WIDTH = 42;
const processingOrderIds = new Set<string>();
let lastSuccessfulPollAt: string | null = null;
let lastPollError: string | null = null;

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

function healthPort() {
  return Number(process.env.PRINT_BRIDGE_HEALTH_PORT ?? DEFAULT_HEALTH_PORT);
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
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
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
      menuItemId: item.menu_item_id,
      menuItemNumber: item.menu_item_number,
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
  // GB18030 works for most ESC/POS printers configured for Chinese output.
  // If Chinese still renders as boxes/question marks, try GBK for this model.
  return iconv.encode(`${cleanText(value)}\n`, "gb18030");
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

function fontA() {
  return command(0x1b, 0x4d, 0x00);
}

function printModeNormal() {
  return command(0x1b, 0x21, 0x00);
}

function normalText() {
  return Buffer.concat([printModeNormal(), fontA(), textSize(0, 0), bold(false)]);
}

function doubleWidthHeightOn() {
  return textSize(1, 1);
}

function textSizeNormal() {
  return textSize(0, 0);
}

function chineseItemLine(item: PrintableOrder["items"][number]) {
  return (
    getReceiptChineseName(item.menuItemId) ??
    getReceiptChineseName(item.menuItemNumber) ??
    null
  );
}

function formatReceiptCode(code?: string | null, fallbackIndex = 1) {
  const normalized = normalizeReceiptItemCode(code ?? "");
  const looksLikeMenuCode = /^(?:[A-Z]\d+|[A-Z]|\d+)$/.test(normalized);
  return normalized && looksLikeMenuCode ? `${normalized}.` : `${fallbackIndex}.`;
}

function modifierLines(value: string) {
  return wrapText(value, RECEIPT_WIDTH - 3).map((lineText) => `   ${lineText}`);
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

function compactPrice(cents: number) {
  return cents > 0 ? ` +${money(cents / 100)}` : "";
}

function compactModifierLabel(
  modifier: NonNullable<PrintableOrder["items"][number]["modifiers"]>[number],
) {
  if (modifier.groupId === "item-option") {
    return compactOptionLabel(modifier.optionLabel);
  }

  return `${modifier.groupLabel}: ${modifier.optionLabel}${compactPrice(
    modifier.priceDeltaCents,
  )}`;
}

function selectedSizeModifier(item: PrintableOrder["items"][number]) {
  if (
    !item.selectedPriceLabel ||
    ["Regular", "Base"].includes(item.selectedPriceLabel)
  ) {
    return null;
  }

  return compactOptionLabel(item.selectedPriceLabel);
}

function compactItemModifiers(item: PrintableOrder["items"][number]) {
  const labels: string[] = [];
  const sizeLabel = selectedSizeModifier(item);

  if (sizeLabel) {
    labels.push(sizeLabel);
  }

  item.modifiers?.forEach((modifier) => {
    labels.push(compactModifierLabel(modifier));
  });

  return labels;
}

function printHeader(parts: Buffer[]) {
  parts.push(command(0x1b, 0x40));
  parts.push(fontA(), printModeNormal());
  parts.push(align("center"), bold(true), textSize(1, 0), text("CHINA 1"));
  parts.push(normalText());
  parts.push(text("450 S Broadway, Camden, NJ 08103"));
  parts.push(text("Tel:(856)342-6828"));
  parts.push(text(""));
}

function printOrderMeta(parts: Buffer[], order: PrintableOrder) {
  parts.push(normalText(), align("center"), bold(true), textSize(1, 1));
  parts.push(text("Online_Order / Pickup"));
  parts.push(normalText(), align("left"));
  parts.push(text(line(receiptDateTime(order.createdAt), order.orderNumber)));
  parts.push(text("Server: Online"));
  parts.push(text("-".repeat(RECEIPT_WIDTH)));
  parts.push(text(pickupLabel(order)));
  parts.push(text(`Payment: ${order.paymentMethod}`));
  if (isCashAppPayment(order.paymentMethod)) {
  parts.push(text("Verify Cash App payment manually"));
  }
  parts.push(text(`Name: ${order.customerName}`));
  parts.push(text(`Phone: ${order.phone}`));
  parts.push(text("-".repeat(RECEIPT_WIDTH)));
}

function printItem(
  parts: Buffer[],
  item: PrintableOrder["items"][number],
  index: number,
) {
  const chineseLine = chineseItemLine(item);
  const codeLabel = formatReceiptCode(item.menuItemNumber ?? item.menuItemId, index + 1);
  const quantityPrefix = item.quantity > 1 ? `${item.quantity}x ` : "";
  const itemTotal = money(item.unitPrice * item.quantity);

  console.log("[print-bridge] chinese lookup", {
    chineseName: chineseLine,
    menuItemId: item.menuItemId,
    menuItemNumber: item.menuItemNumber,
    name: item.name,
  });

  if (chineseLine) {
    parts.push(normalText(), bold(true), doubleWidthHeightOn());
    modifierLines(`${codeLabel} ${quantityPrefix}${chineseLine}`).forEach(
      (chineseText) => {
        parts.push(text(chineseText.trimStart()));
      },
    );
    parts.push(textSizeNormal(), bold(false));
  }

  parts.push(normalText());
  wrapText(`${codeLabel} ${quantityPrefix}${item.name}`, RECEIPT_WIDTH - 8).forEach(
    (itemLine, lineIndex) => {
      parts.push(text(lineIndex === 0 ? line(itemLine, itemTotal) : itemLine));
    },
  );

  parts.push(normalText());
  compactItemModifiers(item).forEach((modifier) => {
    modifierLines(`[${modifier}]`).forEach((modifierLine) => {
      parts.push(text(modifierLine));
    });
  });

  if (item.notes) {
    parts.push(normalText());
    modifierLines(`Note: ${item.notes}`).forEach((modifierLine) => {
      parts.push(text(modifierLine));
    });
  }
}

function printTotals(parts: Buffer[], order: PrintableOrder) {
  const totals = calculateOrderTotals(order.subtotal, order.paymentMethod);
  parts.push(normalText());

  if (order.specialInstructions) {
    parts.push(text("-".repeat(RECEIPT_WIDTH)));
    modifierLines(`Order note: ${order.specialInstructions}`).forEach((modifierLine) => {
      parts.push(text(modifierLine));
    });
  }

  parts.push(text("-".repeat(RECEIPT_WIDTH)));
  parts.push(text(line("Subtotal:", money(totals.subtotal))));
  parts.push(text(line("Tax:", money(totals.salesTax))));
  if (totals.cashAppFee > 0) {
  parts.push(text(line("Cash App Fee:", money(totals.cashAppFee))));
  }
  parts.push(fontA(), bold(true), textSize(0, 1));
  parts.push(text(line("Total:", money(totals.total))));
  parts.push(normalText());
}

function printFooter(parts: Buffer[]) {
  parts.push(normalText());
  parts.push(text("-".repeat(RECEIPT_WIDTH)));
  parts.push(align("center"));
  parts.push(text("Prices subject to change."));
  parts.push(text("Thank You"));
  parts.push(text("\n\n"));
  parts.push(command(0x1d, 0x56, 0x42, 0x00));
}

export function buildReceiptBuffer(order: PrintableOrder) {
  const parts: Buffer[] = [];

  printHeader(parts);
  printOrderMeta(parts, order);

  order.items.forEach((item, index) => {
    printItem(parts, item, index);
    if (index < order.items.length - 1) {
      parts.push(text(""));
    }
  });

  printTotals(parts, order);
  printFooter(parts);

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

async function runPollCycle() {
  try {
    await pollOnce();
    lastSuccessfulPollAt = new Date().toISOString();
    lastPollError = null;
  } catch (error) {
    lastPollError = error instanceof Error ? error.message : "Unknown polling error";
    throw error;
  }
}

function startHealthServer() {
  const server = createServer((request, response) => {
    if (request.url !== "/health") {
      response.writeHead(404).end("Not found\n");
      return;
    }

    const status = lastPollError ? 503 : 200;
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        service: "china1-print-bridge",
        status: status === 200 ? "ok" : "poll-error",
        printer: `${printerHost()}:${printerPort()}`,
        lastSuccessfulPollAt,
        lastPollError,
      }),
    );
  });

  server.listen(healthPort(), "0.0.0.0", () => {
    console.log(`[print-bridge] Health endpoint: http://0.0.0.0:${healthPort()}/health`);
  });

  return server;
}

export async function runPrintBridge() {
  console.log("[print-bridge] China 1 thermal print bridge starting.");
  console.log(`[print-bridge] Printer: ${printerHost()}:${printerPort()}`);
  console.log("[print-bridge] Run this on only one restaurant computer at a time.");

  const healthServer = startHealthServer();
  await runPollCycle();

  const interval = windowlessInterval(async () => {
    try {
      await runPollCycle();
    } catch (error) {
      console.error("[print-bridge] Poll failed.", error);
    }
  }, POLL_INTERVAL_MS);

  registerShutdownHandlers(interval, healthServer);
}

function windowlessInterval(callback: () => void, ms: number) {
  return setInterval(callback, ms);
}

function registerShutdownHandlers(interval: NodeJS.Timeout, server: Server) {
  const shutdown = (signal: string) => {
    console.log(`[print-bridge] ${signal} received; stopping cleanly.`);
    clearInterval(interval);
    server.close(() => process.exit(0));
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  runPrintBridge().catch((error) => {
    console.error("[print-bridge] Fatal startup error.", error);
    process.exit(1);
  });
}

import dotenv from "dotenv";
import { buildReceiptBuffer, sendToPrinter } from "./print-bridge.ts";
import type { PrintableOrder } from "./print-bridge.ts";

dotenv.config({ path: ".env.local" });
dotenv.config();

const testOrder: PrintableOrder = {
  createdAt: new Date().toISOString(),
  customerName: "Test Customer",
  id: "test-print",
  items: [
    {
      id: "item-1",
      name: "General Tso's Chicken",
      notes: "No broccoli",
      quantity: 1,
      spicy: true,
      unitPrice: 12.95,
    },
    {
      id: "item-2",
      name: "Crab Rangoon",
      notes: "30 pcs",
      quantity: 2,
      spicy: false,
      unitPrice: 6.95,
    },
  ],
  orderNumber: "TEST-001",
  paymentMethod: "Cash",
  phone: "856-342-6828",
  pickupChoice: "ASAP",
  pickupTime: "ASAP",
  specialInstructions: "This is a printer test.",
  subtotal: 26.85,
};

console.log("[print-test] Sending test receipt to thermal printer...");

sendToPrinter(buildReceiptBuffer(testOrder))
  .then(() => {
    console.log("[print-test] Test receipt sent successfully.");
  })
  .catch((error) => {
    console.error("[print-test] Test receipt failed.", error);
    process.exit(1);
  });

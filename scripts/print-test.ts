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
      menuItemId: "B",
      modifiers: [
        {
          groupId: "specialty-platter-side",
          groupLabel: "Add a Side",
          optionId: "french-fries",
          optionLabel: "French Fries",
          priceDeltaCents: 225,
        },
      ],
      name: "Fried Chicken Wings (4 Whole)",
      notes: "",
      quantity: 1,
      spicy: false,
      unitPrice: 8.75,
    },
    {
      id: "item-2",
      menuItemId: "12",
      modifiers: [
        {
          groupId: "item-option",
          groupLabel: "Option",
          optionId: "fried",
          optionLabel: "Fried",
          priceDeltaCents: 0,
        },
      ],
      name: "Dumplings",
      notes: "",
      quantity: 1,
      spicy: false,
      unitPrice: 7.99,
    },
  ],
  orderNumber: "TEST-001",
  paymentMethod: "Cash",
  phone: "856-342-6828",
  pickupChoice: "ASAP",
  pickupTime: "ASAP",
  specialInstructions: "This is a printer test.",
  subtotal: 16.74,
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

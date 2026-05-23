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
      id: "item-0",
      menuItemId: "A",
      menuItemNumber: "A",
      name: "Honey Chicken Wings (8 pcs)",
      notes: "",
      quantity: 1,
      spicy: false,
      unitPrice: 7.35,
    },
    {
      id: "item-1",
      menuItemId: "B",
      menuItemNumber: "B",
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
      menuItemNumber: "12",
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
    {
      id: "item-3",
      menuItemId: "24",
      menuItemNumber: "24",
      modifiers: [
        {
          groupId: "item-option",
          groupLabel: "Option",
          optionId: "noodle",
          optionLabel: "Noodle",
          priceDeltaCents: 0,
        },
      ],
      name: "Chicken Soup",
      notes: "",
      quantity: 1,
      selectedPrice: "$3.25",
      selectedPriceId: "pt",
      selectedPriceLabel: "Pt",
      spicy: false,
      unitPrice: 3.25,
    },
    {
      id: "item-4",
      menuItemId: "L12",
      menuItemNumber: "L12",
      name: "Hunan Chicken",
      notes: "",
      quantity: 1,
      spicy: true,
      unitPrice: 8.99,
    },
    {
      id: "item-5",
      menuItemId: "S1",
      menuItemNumber: "S1",
      name: "General Tso's Chicken",
      notes: "No broccoli",
      quantity: 1,
      selectedPrice: "$12.95",
      selectedPriceId: "lg",
      selectedPriceLabel: "Lg",
      spicy: true,
      unitPrice: 12.95,
    },
    {
      id: "item-6",
      menuItemId: "C13",
      menuItemNumber: "C13",
      name: "General Tso's Chicken",
      notes: "",
      quantity: 1,
      spicy: true,
      unitPrice: 10.99,
    },
  ],
  orderNumber: "TEST-001",
  paymentMethod: "Cash",
  phone: "856-342-6828",
  pickupChoice: "ASAP",
  pickupTime: "ASAP",
  specialInstructions: "This is a printer test.",
  subtotal: 60.26,
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

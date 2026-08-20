import dotenv from "dotenv";
import {
  buildReceiptBuffer,
  playPrintedOrderAlert,
  sendToPrinter,
} from "./print-bridge.ts";
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
      menuItemId: "C",
      menuItemNumber: "C",
      name: "Fried Chicken Wings (4 Whole)",
      notes: "",
      quantity: 1,
      selectedPrice: "$8.75",
      selectedPriceId: "french-fries",
      selectedPriceLabel: "French Fries",
      spicy: false,
      unitPrice: 8.75,
    },
    {
      id: "item-2",
      menuItemId: "13",
      menuItemNumber: "13",
      modifiers: [
        {
          groupId: "item-option",
          groupLabel: "Option",
          optionId: "fried",
          optionLabel: "Fried",
          priceDeltaCents: 0,
        },
      ],
      name: "Steamed or Fried Dumplings (8)",
      notes: "",
      quantity: 1,
      spicy: false,
      unitPrice: 7.5,
    },
    {
      id: "item-3",
      menuItemId: "26",
      menuItemNumber: "26",
      modifiers: [
        {
          groupId: "item-option",
          groupLabel: "Option",
          optionId: "noodle",
          optionLabel: "Noodle",
          priceDeltaCents: 0,
        },
      ],
      name: "Chicken Noodle or Rice Soup",
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
      modifiers: [
        {
          groupId: "lunch-special-rice",
          groupLabel: "Rice",
          optionId: "fried-rice",
          optionLabel: "Fried Rice",
          priceDeltaCents: 0,
        },
      ],
      name: "General Tso's Chicken",
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
      menuItemId: "C12",
      menuItemNumber: "C12",
      modifiers: [
        {
          groupId: "special-combination-rice",
          groupLabel: "Rice",
          optionId: "white-rice",
          optionLabel: "White Rice",
          priceDeltaCents: 0,
        },
      ],
      name: "General Tso's Chicken",
      notes: "",
      quantity: 1,
      spicy: true,
      unitPrice: 10.99,
    },
  ],
  orderNumber: "TEST-001",
  paymentMethod: "Cash App",
  phone: "856-342-6828",
  pickupChoice: "Later",
  pickupTime: "2026-08-20T18:30",
  specialInstructions: "This is a printer test.",
  subtotal: 59.78,
};

console.log("[print-test] Sending test receipt to thermal printer...");

async function runPrintTest() {
  try {
    await sendToPrinter(buildReceiptBuffer(testOrder));
    console.log("[print-test] Test receipt sent successfully.");
  } catch (error) {
    console.error("[print-test] Test receipt failed.", error);
    process.exit(1);
  }

  console.log("[print-test] Playing computer alert...");
  try {
    await playPrintedOrderAlert();
  } catch (error) {
    console.error(
      "[print-test] Receipt printed, but the computer alert failed.",
      error,
    );
    process.exit(1);
  }
}

void runPrintTest();

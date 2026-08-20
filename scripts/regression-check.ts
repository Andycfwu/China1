import assert from "node:assert/strict";
import iconv from "iconv-lite";
import { menuSections, orderableMenuSections } from "../lib/menu-data.ts";
import {
  createCartModifier,
  formatCartModifierLabel,
  getItemOptionGroup,
  getModifierGroupsForItem,
  isSpecialtyPlatterSection,
} from "../lib/menu-modifiers.ts";
import {
  findMenuItemWithSection,
  isCombinationCartItem,
  isItemCurrentlyAvailable,
  isLunchSpecialAvailable,
  isValueComboAvailable,
} from "../lib/order-availability.ts";
import {
  formatPickupTime,
  isValidScheduledPickupTime,
} from "../lib/pickup-time.ts";
import {
  calculateOrderTotalCents,
  isCashAppPayment,
  parsePriceOptions,
} from "../lib/pricing.ts";
import { receiptChineseNames } from "../lib/receipt-chinese-names.ts";
import { buildReceiptBuffer } from "./print-bridge.ts";

const expectedSectionCounts: Record<string, number> = {
  appetizers: 22,
  beef: 10,
  chicken: 18,
  "chow-mei-fun": 7,
  "chefs-specialties": 16,
  "combination-platters": 24,
  "diet-menu": 3,
  drinks: 10,
  "egg-foo-young": 9,
  "family-specials": 6,
  "fried-rice": 13,
  "lo-mein": 8,
  "lunch-special": 22,
  pork: 6,
  seafood: 9,
  soup: 8,
  "specialty-platters": 22,
  "sweet-sour": 2,
  "value-combo": 1,
  vegetable: 5,
  "yat-gaw-mein": 5,
};

for (const [sectionId, expectedCount] of Object.entries(expectedSectionCounts)) {
  const section = menuSections.find((candidate) => candidate.id === sectionId);
  assert(section, `Missing menu section: ${sectionId}`);
  assert.equal(
    section.items.length,
    expectedCount,
    `${sectionId} item count changed`,
  );
}

const stableItemKeys = orderableMenuSections.flatMap((section) =>
  section.items.map((item) => `${section.id}:${item.id}`),
);
assert.equal(
  new Set(stableItemKeys).size,
  stableItemKeys.length,
  "Duplicate category/code identity detected",
);

const specialtySection = menuSections.find((section) =>
  isSpecialtyPlatterSection(section),
);
assert(specialtySection, "Specialty Platters section is missing");
assert.deepEqual(
  specialtySection.items.map((item) => item.id),
  "ABCDEFGHIJKLMNOPQRSTUV".split(""),
  "Specialty Platter codes must remain A-V",
);
for (const item of specialtySection.items) {
  const options = parsePriceOptions(item.price);
  assert(options.length >= 9, `${item.id} is missing Specialty options`);
  assert(
    options.every((option) => !/\sor\s/i.test(option.label)),
    `${item.id} has an ambiguous combined option`,
  );
  assert.equal(
    getModifierGroupsForItem(specialtySection, item).length,
    0,
    `${item.id} should use full-price variants without modifier deltas`,
  );
}

const chowMeiFun = menuSections.find((section) => section.id === "chow-mei-fun");
assert(chowMeiFun, "Chow Mei Fun section is missing");
assert(
  chowMeiFun.items.every((item) => parsePriceOptions(item.price).length === 1),
  "Chow Mei Fun must remain fixed-price without sizes",
);

const valueSection = menuSections.find((section) => section.id === "value-combo");
assert(valueSection, "Value Combo section is missing");
const valueItem = valueSection.items[0];
assert.equal(parsePriceOptions(valueItem.price)[0]?.unitPriceCents, 999);
const valueGroups = getModifierGroupsForItem(valueSection, valueItem);
assert.deepEqual(
  valueGroups.map((group) => [group.id, group.required, group.options.length]),
  [
    ["value-combo-choice-1", true, 18],
    ["value-combo-choice-2", true, 18],
    ["value-combo-rice", true, 2],
  ],
);
assert(
  valueGroups.every((group) =>
    group.options.every((option) => option.priceDeltaCents === 0),
  ),
  "Value Combo selections must not change the $9.99 price",
);

const mondayNoonEastern = new Date("2026-08-17T16:00:00Z");
const mondayAfterLunchEastern = new Date("2026-08-17T19:05:00Z");
const mondayBeforeFiveEastern = new Date("2026-08-17T20:59:00Z");
const mondayAfterFiveEastern = new Date("2026-08-17T21:05:00Z");
assert.equal(isLunchSpecialAvailable(mondayNoonEastern), true);
assert.equal(isLunchSpecialAvailable(mondayAfterLunchEastern), false);
assert.equal(isValueComboAvailable(mondayBeforeFiveEastern), true);
assert.equal(isValueComboAvailable(mondayAfterFiveEastern), false);

for (const [key, shouldBeAvailable] of [
  ["lunch-special:L12", false],
  ["chicken:88", true],
  ["combination-platters:C12", true],
  ["chefs-specialties:S1", true],
] as const) {
  const itemId = key.split(":")[1];
  const match = findMenuItemWithSection(itemId, key);
  assert(match, `Could not resolve ${key}`);
  assert.equal(
    isItemCurrentlyAvailable(match.item, match.section, mondayAfterLunchEastern),
    shouldBeAvailable,
    `${key} availability is not category-scoped`,
  );
}

assert.equal(
  isCombinationCartItem({
    menuItemId: "C",
    menuItemKey: "specialty-platters:C",
  }),
  false,
  "Specialty Platter C must not receive Combination inclusions",
);
assert.equal(
  isCombinationCartItem({
    menuItemId: "C12",
    menuItemKey: "combination-platters:C12",
  }),
  true,
);

const drinksSection = menuSections.find((section) => section.id === "drinks");
assert(drinksSection, "Drinks section is missing");
assert.deepEqual(
  drinksSection.items.map((item) => [item.id, item.price]),
  [
    ["DR-1", "$4.00"],
    ["DR-2", "$2.00"],
    ["DR-3", "$2.50"],
    ["DR-4", "$1.25"],
    ["DR-5", "$1.00"],
    ["DR-6", "$2.50"],
    ["DR-7", "$2.50"],
    ["DR-8", "$3.50"],
    ["DR-9", "$2.50"],
    ["DR-10", "$2.50"],
  ],
);
for (const item of drinksSection.items.slice(0, 5)) {
  const sectionGroups = getModifierGroupsForItem(drinksSection, item);
  const flavorGroup = getItemOptionGroup(item);
  assert.equal(sectionGroups.length, 0, `${item.id} should use its item flavor option`);
  assert(flavorGroup, `${item.id} is missing its flavor group`);
  assert.equal(flavorGroup.label, "Flavor");
  assert.equal(flavorGroup.required, true);
  assert.equal(item.optionLabel, "Flavor");
  assert(item.options?.length, `${item.id} is missing flavors`);
}
for (const item of drinksSection.items.slice(5)) {
  assert.equal(item.options, undefined, `${item.id} should be a fixed drink`);
}
assert.equal(
  drinksSection.items.some((item) =>
    item.options?.some((option) => option.label === "American Dew"),
  ),
  false,
);

const bottleSoda = drinksSection.items.find((item) => item.id === "DR-3");
assert(bottleSoda, "Bottle Soda is missing");
const bottleFlavorGroup = getItemOptionGroup(bottleSoda);
assert(bottleFlavorGroup, "Bottle Soda flavor group is missing");
const mountainDew = bottleFlavorGroup.options.find(
  (option) => option.id === "mountain-dew",
);
assert(mountainDew, "Bottle Soda Mountain Dew option is missing");
const mountainDewModifier = createCartModifier(
  bottleFlavorGroup,
  mountainDew,
);
assert.equal(formatCartModifierLabel(mountainDewModifier), "Flavor: Mountain Dew");

const drinkReceipt = iconv.decode(
  buildReceiptBuffer({
    createdAt: "2026-08-20T16:00:00-04:00",
    customerName: "Drink Test",
    id: "drink-order",
    items: [
      {
        id: "drink-item",
        menuItemId: "DR-3",
        menuItemNumber: "DR-3",
        modifiers: [mountainDewModifier],
        name: "Bottle Soda",
        notes: "",
        quantity: 1,
        selectedPrice: "$2.50",
        selectedPriceId: "regular",
        selectedPriceLabel: "Regular",
        spicy: false,
        unitPrice: 2.5,
      },
    ],
    orderNumber: "DRINK-TEST",
    paymentMethod: "Cash",
    phone: "856-342-6828",
    pickupChoice: "ASAP",
    pickupTime: "ASAP",
    specialInstructions: "",
    subtotal: 2.5,
  }),
  "gb18030",
);
assert(drinkReceipt.includes("DR-3. Bottle Soda"));
assert(drinkReceipt.includes("[Mountain Dew]"));
assert(!drinkReceipt.includes("SCHEDULED PICKUP"));
assert(drinkReceipt.includes("Pickup: ASAP"));

assert.deepEqual(
  ["Cash App", "cashapp", "cash_app"].map(isCashAppPayment),
  [true, true, true],
);
assert.deepEqual(calculateOrderTotalCents(999, "cash_app"), {
  cashAppFeeCents: 100,
  salesTaxCents: 70,
  subtotalCents: 999,
  totalCents: 1169,
});

assert.equal(formatPickupTime("2026-08-20T18:30"), "6:30 PM");
assert.equal(isValidScheduledPickupTime("2026-08-20T18:30"), true);
assert.equal(isValidScheduledPickupTime("2026-02-30T18:30"), false);
assert.equal(isValidScheduledPickupTime("6:30 PM"), false);

const activeCodes = new Set(
  orderableMenuSections.flatMap((section) =>
    section.items.map((item) => item.displayId ?? item.id),
  ),
);
const orphanChineseCodes = Object.keys(receiptChineseNames).filter(
  (code) => !activeCodes.has(code),
);
assert.deepEqual(
  orphanChineseCodes,
  [],
  "Receipt mapping contains stale codes that are not in the active menu",
);
assert.equal(receiptChineseNames["13"], "水饺/锅贴");
assert.equal(receiptChineseNames["26"], "鸡面/饭汤");
assert.equal(receiptChineseNames.L12, "左宗鸡");
assert.equal(receiptChineseNames.C12, "左宗鸡");
assert.equal(receiptChineseNames.S1, "左宗鸡");

const scheduledReceiptBuffer = buildReceiptBuffer({
    createdAt: "2026-08-20T15:42:00-04:00",
    customerName: "Regression Test",
    id: "regression-order",
    items: [
      {
        id: "regression-item",
        menuItemId: "VC1",
        menuItemNumber: "VC",
        modifiers: [
          {
            groupId: "value-combo-choice-1",
            groupLabel: "Choice 1",
            optionId: "a-fried-chicken-wings",
            optionLabel: "A. Fried Chicken Wings (2)",
            priceDeltaCents: 0,
          },
          {
            groupId: "value-combo-choice-2",
            groupLabel: "Choice 2",
            optionId: "c-bang-bang-shrimp",
            optionLabel: "C. Bang Bang Shrimp (6)",
            priceDeltaCents: 0,
          },
          {
            groupId: "value-combo-rice",
            groupLabel: "Rice",
            optionId: "fried-rice",
            optionLabel: "Fried Rice",
            priceDeltaCents: 0,
          },
        ],
        name: "Pick Any 2 Value Combo",
        notes: "",
        quantity: 1,
        selectedPrice: "$9.99",
        selectedPriceId: "regular",
        selectedPriceLabel: "Regular",
        spicy: false,
        unitPrice: 9.99,
      },
    ],
    orderNumber: "REGRESSION",
    paymentMethod: "Cash",
    phone: "856-342-6828",
    pickupChoice: "Online_Pickup",
    pickupTime: "2026-08-20T19:42",
    specialInstructions: "",
    subtotal: 9.99,
  });
const valueComboReceipt = iconv.decode(scheduledReceiptBuffer, "gb18030");
assert(valueComboReceipt.includes("SCHEDULED PICKUP"));
assert(valueComboReceipt.includes("7:42 PM"));
assert(valueComboReceipt.includes("Order Placed: 3:42 PM"));
assert(!valueComboReceipt.includes("2026-08-20T19:42"));
assert(
  valueComboReceipt.indexOf("SCHEDULED PICKUP") <
    valueComboReceipt.indexOf("Order Placed:"),
);
assert(scheduledReceiptBuffer.includes(Buffer.from([0x1d, 0x21, 0x11])));
assert(valueComboReceipt.includes("Choice 1: A. Fried Chicken Wings (2)"));
assert(valueComboReceipt.includes("Choice 2: C. Bang Bang Shrimp (6)"));
assert(valueComboReceipt.includes("Rice: Fried Rice"));

const nextDayReceipt = iconv.decode(
  buildReceiptBuffer({
    createdAt: "2026-08-20T15:42:00-04:00",
    customerName: "Next Day Test",
    id: "next-day-order",
    items: [],
    orderNumber: "NEXT-DAY",
    paymentMethod: "Cash",
    phone: "856-342-6828",
    pickupChoice: "Scheduled",
    pickupTime: "2026-08-21T19:42",
    specialInstructions: "",
    subtotal: 0,
  }),
  "gb18030",
);
assert(nextDayReceipt.includes("FRI, AUG 21"));

for (const section of orderableMenuSections) {
  for (const item of section.items) {
    const options = parsePriceOptions(item.price);
    assert(options.length > 0, `${section.id}:${item.id} has no price option`);
    assert(
      options.every((option) => option.unitPriceCents > 0),
      `${section.id}:${item.id} has an invalid price`,
    );
  }
}

console.log(
  `[regression-check] Passed ${stableItemKeys.length} menu items across ${menuSections.length} active sections plus party trays.`,
);

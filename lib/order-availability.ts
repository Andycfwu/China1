import { menuSections, orderableMenuSections } from "./menu-data.ts";
import type { MenuItem, MenuSection } from "./menu-data.ts";
import type { CartItem } from "./order-types.ts";

export const RESTAURANT_TIME_ZONE = "America/New_York";
export const LUNCH_SPECIAL_HOURS_MESSAGE =
  "Lunch specials are available Monday-Saturday, 11:00 AM-3:00 PM.";
export const LUNCH_SPECIAL_UNAVAILABLE_MESSAGE =
  "Lunch specials are currently unavailable. Please choose from the regular menu.";
export const LUNCH_CHECKOUT_BLOCK_MESSAGE =
  "Lunch specials are currently unavailable. Please remove lunch special items or order during lunch hours.";
export const VALUE_COMBO_HOURS_MESSAGE =
  "$9.99 Value Combo is available daily, 11:00 AM-5:00 PM.";
export const VALUE_COMBO_UNAVAILABLE_MESSAGE =
  "$9.99 Value Combo is currently unavailable. Please choose from the regular menu.";
export const VALUE_COMBO_CHECKOUT_BLOCK_MESSAGE =
  "$9.99 Value Combo is currently unavailable. Please remove value combo items or order during value combo hours.";

const LUNCH_START_MINUTES = 11 * 60;
const LUNCH_END_MINUTES = 15 * 60;
const VALUE_COMBO_START_MINUTES = 11 * 60;
const VALUE_COMBO_END_MINUTES = 17 * 60;

function getRestaurantTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone: RESTAURANT_TIME_ZONE,
    weekday: "short",
  }).formatToParts(date);

  const partValue = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    hour: Number(partValue("hour")),
    minute: Number(partValue("minute")),
    weekday: partValue("weekday"),
  };
}

export function isLunchSpecialAvailable(date = new Date()) {
  const { hour, minute, weekday } = getRestaurantTimeParts(date);
  const minutes = hour * 60 + minute;

  return (
    weekday !== "Sun" &&
    minutes >= LUNCH_START_MINUTES &&
    minutes <= LUNCH_END_MINUTES
  );
}

export function isValueComboAvailable(date = new Date()) {
  const { hour, minute } = getRestaurantTimeParts(date);
  const minutes = hour * 60 + minute;

  return minutes >= VALUE_COMBO_START_MINUTES && minutes <= VALUE_COMBO_END_MINUTES;
}

export function isLunchSection(section: Pick<MenuSection, "id" | "title">) {
  return (
    section.id === "lunch-special" ||
    section.title.toLowerCase().includes("lunch special")
  );
}

export function isValueComboSection(section: Pick<MenuSection, "id" | "title">) {
  return section.id === "value-combo";
}

export function isItemCurrentlyAvailable(
  _item: MenuItem,
  section: Pick<MenuSection, "id" | "title">,
  date = new Date(),
) {
  if (isLunchSection(section)) {
    return isLunchSpecialAvailable(date);
  }

  if (isValueComboSection(section)) {
    return isValueComboAvailable(date);
  }

  return true;
}

function parseMenuItemKey(menuItemKey: string) {
  const [sectionId, itemId] = menuItemKey.split(":");

  return sectionId && itemId ? { itemId, sectionId } : null;
}

export function findMenuItemWithSection(menuItemId: string, menuItemKey = "") {
  const parsedKey = parseMenuItemKey(menuItemKey);

  if (parsedKey) {
    const section = orderableMenuSections.find(
      (menuSection) => menuSection.id === parsedKey.sectionId,
    );
    const item = section?.items.find(
      (menuItem) => menuItem.id === parsedKey.itemId && menuItem.id === menuItemId,
    );

    if (section && item) {
      return { item, section };
    }
  }

  for (const section of orderableMenuSections) {
    const item = section.items.find((menuItem) => menuItem.id === menuItemId);

    if (item) {
      return { item, section };
    }
  }

  return null;
}

const lunchSection = menuSections.find(isLunchSection);
const lunchItemIds = new Set(lunchSection?.items.map((item) => item.id) ?? []);

export function isLunchCartItem(
  item: Pick<CartItem, "menuItemId" | "menuItemKey">,
) {
  const parsedKey = parseMenuItemKey(item.menuItemKey ?? "");

  return (
    parsedKey?.sectionId === "lunch-special" ||
    (!parsedKey && lunchItemIds.has(item.menuItemId))
  );
}

export function isValueComboCartItem(
  item: Pick<CartItem, "menuItemId" | "menuItemKey">,
) {
  const parsedKey = parseMenuItemKey(item.menuItemKey ?? "");

  return parsedKey?.sectionId === "value-combo" || item.menuItemId === "VC1";
}

export function isCombinationCartItem(
  item: Pick<CartItem, "menuItemId" | "menuItemKey">,
) {
  const parsedKey = parseMenuItemKey(item.menuItemKey ?? "");

  return (
    parsedKey?.sectionId === "combination-platters" ||
    (!parsedKey && /^C\d+$/.test(item.menuItemId))
  );
}

export function getUnavailableLunchCartItems(
  items: CartItem[],
  date = new Date(),
) {
  if (isLunchSpecialAvailable(date)) {
    return [];
  }

  return items.filter(isLunchCartItem);
}

export function getUnavailableValueComboCartItems(
  items: CartItem[],
  date = new Date(),
) {
  if (isValueComboAvailable(date)) {
    return [];
  }

  return items.filter(isValueComboCartItem);
}

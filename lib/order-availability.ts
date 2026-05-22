import { menuSections, orderableMenuSections } from "@/lib/menu-data";
import type { MenuItem, MenuSection } from "@/lib/menu-data";
import type { CartItem } from "@/lib/order-types";

export const RESTAURANT_TIME_ZONE = "America/New_York";
export const LUNCH_SPECIAL_HOURS_MESSAGE =
  "Lunch specials are available Monday-Saturday, 11:00 AM-3:00 PM.";
export const LUNCH_SPECIAL_UNAVAILABLE_MESSAGE =
  "Lunch specials are currently unavailable. Please choose from the regular menu.";
export const LUNCH_CHECKOUT_BLOCK_MESSAGE =
  "Lunch specials are currently unavailable. Please remove lunch special items or order during lunch hours.";

const LUNCH_START_MINUTES = 11 * 60;
const LUNCH_END_MINUTES = 15 * 60;

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

export function isLunchSection(section: Pick<MenuSection, "id" | "title">) {
  return (
    section.id === "lunch-special" ||
    section.title.toLowerCase().includes("lunch special")
  );
}

export function isItemCurrentlyAvailable(
  _item: MenuItem,
  section: Pick<MenuSection, "id" | "title">,
  date = new Date(),
) {
  return !isLunchSection(section) || isLunchSpecialAvailable(date);
}

export function findMenuItemWithSection(menuItemId: string) {
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
const lunchItemNames = new Set(
  lunchSection?.items.map((item) => item.name.toLowerCase()) ?? [],
);

export function isLunchCartItem(item: Pick<CartItem, "menuItemId" | "name">) {
  return (
    lunchItemIds.has(item.menuItemId) ||
    lunchItemNames.has(item.name.toLowerCase())
  );
}

export function getUnavailableLunchCartItems(
  items: CartItem[],
  date = new Date(),
) {
  // TODO: Enforce lunch availability server-side/API-side before inserting
  // orders. This client helper is the MVP display and checkout guard.
  if (isLunchSpecialAvailable(date)) {
    return [];
  }

  return items.filter(isLunchCartItem);
}

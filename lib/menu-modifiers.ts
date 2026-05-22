import type { MenuSection } from "@/lib/menu-data";

export type MenuModifierOption = {
  id: string;
  label: string;
  priceDeltaCents: number;
};

export type MenuModifierGroup = {
  id: string;
  label: string;
  required: boolean;
  options: MenuModifierOption[];
};

export type CartItemModifier = {
  groupId: string;
  groupLabel: string;
  optionId: string;
  optionLabel: string;
  priceDeltaCents: number;
};

export const SPECIALTY_PLATTER_SIDE_GROUP: MenuModifierGroup = {
  id: "specialty-platter-side",
  label: "Choose Side",
  required: true,
  options: [
    { id: "fried-banana", label: "Fried Banana", priceDeltaCents: 225 },
    { id: "french-fries", label: "French Fries", priceDeltaCents: 225 },
    { id: "plain-fried-rice", label: "Plain Fried Rice", priceDeltaCents: 225 },
    { id: "pork-fried-rice", label: "Pork Fried Rice", priceDeltaCents: 325 },
    { id: "chicken-fried-rice", label: "Chicken Fried Rice", priceDeltaCents: 325 },
    { id: "beef-fried-rice", label: "Beef Fried Rice", priceDeltaCents: 375 },
    { id: "shrimp-fried-rice", label: "Shrimp Fried Rice", priceDeltaCents: 375 },
    { id: "plain-lo-mein", label: "Plain Lo Mein", priceDeltaCents: 375 },
    { id: "vegetable-lo-mein", label: "Vegetable Lo Mein", priceDeltaCents: 575 },
    { id: "chicken-lo-mein", label: "Chicken Lo Mein", priceDeltaCents: 575 },
    { id: "beef-lo-mein", label: "Beef Lo Mein", priceDeltaCents: 575 },
    { id: "shrimp-lo-mein", label: "Shrimp Lo Mein", priceDeltaCents: 575 },
    { id: "pork-lo-mein", label: "Pork Lo Mein", priceDeltaCents: 575 },
    {
      id: "house-special-lo-mein",
      label: "House Special Lo Mein",
      priceDeltaCents: 675,
    },
    { id: "cheese-fries", label: "Cheese Fries", priceDeltaCents: 345 },
  ],
};

export function isSpecialtyPlatterSection(section: Pick<MenuSection, "id">) {
  return section.id === "specialty-platters";
}

export function getModifierGroupsForSection(section: Pick<MenuSection, "id">) {
  return isSpecialtyPlatterSection(section)
    ? [SPECIALTY_PLATTER_SIDE_GROUP]
    : [];
}

export function createCartModifier(
  group: MenuModifierGroup,
  option: MenuModifierOption,
): CartItemModifier {
  return {
    groupId: group.id,
    groupLabel: group.label,
    optionId: option.id,
    optionLabel: option.label,
    priceDeltaCents: option.priceDeltaCents,
  };
}

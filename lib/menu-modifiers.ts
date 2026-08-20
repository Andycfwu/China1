import type { MenuItem, MenuSection } from "./menu-data.ts";

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

export const ITEM_OPTION_GROUP_ID = "item-option";

function normalizeOptionId(label: string, index: number) {
  const normalized = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `option-${index + 1}`;
}

const INCLUDED_RICE_OPTIONS: MenuModifierOption[] = [
  { id: "fried-rice", label: "Fried Rice", priceDeltaCents: 0 },
  { id: "white-rice", label: "White Rice", priceDeltaCents: 0 },
];

const REGULAR_ENTREE_SIDE_UPGRADES: MenuModifierOption[] = [
  { id: "fried-rice", label: "Fried Rice", priceDeltaCents: 200 },
  { id: "chicken-fried-rice", label: "Chicken Fried Rice", priceDeltaCents: 250 },
  { id: "pork-fried-rice", label: "Pork Fried Rice", priceDeltaCents: 250 },
  { id: "beef-fried-rice", label: "Beef Fried Rice", priceDeltaCents: 300 },
  { id: "shrimp-fried-rice", label: "Shrimp Fried Rice", priceDeltaCents: 300 },
  {
    id: "house-special-fried-rice",
    label: "House Special Fried Rice",
    priceDeltaCents: 300,
  },
  { id: "plain-lo-mein", label: "Plain Lo Mein", priceDeltaCents: 300 },
  { id: "chicken-lo-mein", label: "Chicken Lo Mein", priceDeltaCents: 375 },
  { id: "pork-lo-mein", label: "Pork Lo Mein", priceDeltaCents: 375 },
  { id: "beef-lo-mein", label: "Beef Lo Mein", priceDeltaCents: 450 },
  { id: "shrimp-lo-mein", label: "Shrimp Lo Mein", priceDeltaCents: 450 },
  {
    id: "house-special-lo-mein",
    label: "House Special Lo Mein",
    priceDeltaCents: 550,
  },
];

const FAMILY_SPECIAL_FRIED_RICE_OPTIONS: MenuModifierOption[] = [
  { id: "plain-fried-rice", label: "Plain Fried Rice", priceDeltaCents: 0 },
  { id: "vegetable-fried-rice", label: "Vegetable Fried Rice", priceDeltaCents: 0 },
  { id: "roast-pork-fried-rice", label: "Roast Pork Fried Rice", priceDeltaCents: 0 },
  { id: "chicken-fried-rice", label: "Chicken Fried Rice", priceDeltaCents: 0 },
  { id: "beef-fried-rice", label: "Beef Fried Rice", priceDeltaCents: 0 },
  { id: "shrimp-fried-rice", label: "Shrimp Fried Rice", priceDeltaCents: 0 },
  {
    id: "house-special-fried-rice",
    label: "House Special Fried Rice",
    priceDeltaCents: 0,
  },
  { id: "krabmeat-fried-rice", label: "Krabmeat Fried Rice", priceDeltaCents: 0 },
];

const FAMILY_SPECIAL_SOUP_OPTIONS: MenuModifierOption[] = [
  { id: "wonton-soup", label: "Wonton Soup", priceDeltaCents: 0 },
  { id: "egg-drop-soup", label: "Egg Drop Soup", priceDeltaCents: 0 },
  { id: "hot-sour-soup", label: "Hot & Sour Soup", priceDeltaCents: 0 },
];

const FAMILY_SPECIAL_LO_MEIN_OPTIONS: MenuModifierOption[] = [
  { id: "plain-lo-mein", label: "Plain Lo Mein", priceDeltaCents: 0 },
  { id: "vegetable-lo-mein", label: "Vegetable Lo Mein", priceDeltaCents: 0 },
  { id: "roast-pork-lo-mein", label: "Roast Pork Lo Mein", priceDeltaCents: 0 },
  { id: "chicken-lo-mein", label: "Chicken Lo Mein", priceDeltaCents: 0 },
  { id: "beef-lo-mein", label: "Beef Lo Mein", priceDeltaCents: 0 },
  { id: "shrimp-lo-mein", label: "Shrimp Lo Mein", priceDeltaCents: 0 },
  { id: "house-special-lo-mein", label: "House Special Lo Mein", priceDeltaCents: 0 },
];

const FAMILY_SPECIAL_A_ENTREE_OPTIONS: MenuModifierOption[] = [
  { id: "general-tsos-chicken", label: "General Tso's Chicken", priceDeltaCents: 0 },
  { id: "sesame-chicken", label: "Sesame Chicken", priceDeltaCents: 0 },
  { id: "bourbon-chicken", label: "Bourbon Chicken", priceDeltaCents: 0 },
  { id: "popcorn-chicken", label: "Popcorn Chicken", priceDeltaCents: 0 },
];

const FAMILY_SPECIAL_B_ENTREE_OPTIONS: MenuModifierOption[] = [
  { id: "honey-chicken", label: "Honey Chicken", priceDeltaCents: 0 },
  { id: "sweet-sour-chicken", label: "Sweet & Sour Chicken", priceDeltaCents: 0 },
  { id: "sesame-chicken", label: "Sesame Chicken", priceDeltaCents: 0 },
  { id: "general-tsos-chicken", label: "General Tso's Chicken", priceDeltaCents: 0 },
];

const FAMILY_SPECIAL_C_ENTREE_OPTIONS: MenuModifierOption[] = [
  { id: "honey-chicken", label: "Honey Chicken", priceDeltaCents: 0 },
  { id: "sweet-sour-chicken", label: "Sweet & Sour Chicken", priceDeltaCents: 0 },
  { id: "sesame-chicken", label: "Sesame Chicken", priceDeltaCents: 0 },
  { id: "general-tsos-chicken", label: "General Tso's Chicken", priceDeltaCents: 0 },
  { id: "chicken-broccoli", label: "Chicken Broccoli", priceDeltaCents: 0 },
  { id: "popcorn-chicken", label: "Popcorn Chicken", priceDeltaCents: 0 },
];

const FAMILY_SPECIAL_VEGETABLE_MEAT_OPTIONS: MenuModifierOption[] = [
  { id: "chicken-mixed-vegetable", label: "Chicken with Mixed Vegetable", priceDeltaCents: 0 },
  { id: "beef-mixed-vegetables", label: "Beef with Mixed Vegetables", priceDeltaCents: 0 },
  { id: "shrimp-mixed-vegetable", label: "Shrimp with Mixed Vegetable", priceDeltaCents: 0 },
  {
    id: "roast-pork-mixed-vegetable",
    label: "Roast Pork with Mixed Vegetable",
    priceDeltaCents: 0,
  },
];

const VALUE_COMBO_CHOICES: MenuModifierOption[] = [
  { id: "a-fried-chicken-wings", label: "A. Fried Chicken Wings (2)", priceDeltaCents: 0 },
  { id: "b-popcorn-chicken", label: "B. Popcorn Chicken", priceDeltaCents: 0 },
  { id: "c-bang-bang-shrimp", label: "C. Bang Bang Shrimp (6)", priceDeltaCents: 0 },
  { id: "d-fried-fish", label: "D. Fried Fish (1 Piece)", priceDeltaCents: 0 },
  { id: "e-fried-shrimp-basket", label: "E. Fried Shrimp Basket (6)", priceDeltaCents: 0 },
  { id: "f-chicken-on-stick", label: "F. Chicken on Stick (2)", priceDeltaCents: 0 },
  { id: "g-krab-rangoons", label: "G. Krab Rangoons (3)", priceDeltaCents: 0 },
  { id: "h-chicken-fingers", label: "H. Chicken Fingers (2)", priceDeltaCents: 0 },
  { id: "i-old-bay-shrimp", label: "I. Old Bay Shrimp (6)", priceDeltaCents: 0 },
  { id: "j-sweet-sour-chicken", label: "J. Sweet & Sour Chicken", priceDeltaCents: 0 },
  { id: "k-fried-chicken-gizzards", label: "K. Fried Chicken Gizzards", priceDeltaCents: 0 },
  { id: "l-spare-rib-tips", label: "L. Spare Rib Tips", priceDeltaCents: 0 },
  { id: "m-fried-scallop", label: "M. Fried Scallop (4)", priceDeltaCents: 0 },
  { id: "n-shrimp-on-stick", label: "N. Shrimp on Stick (2)", priceDeltaCents: 0 },
  { id: "o-fried-krab-sticks", label: "O. Fried Krab Sticks (2)", priceDeltaCents: 0 },
  { id: "p-mozzarella-sticks", label: "P. Mozzarella Sticks (3)", priceDeltaCents: 0 },
  { id: "q-sesame-ball", label: "Q. Sesame Ball (5)", priceDeltaCents: 0 },
  { id: "r-steamed-dumplings", label: "R. Steamed Dumplings (3)", priceDeltaCents: 0 },
];

export const LUNCH_SPECIAL_RICE_GROUP: MenuModifierGroup = {
  id: "lunch-special-rice",
  label: "Rice",
  required: true,
  options: INCLUDED_RICE_OPTIONS,
};

export const SPECIAL_COMBINATION_RICE_GROUP: MenuModifierGroup = {
  id: "special-combination-rice",
  label: "Rice",
  required: true,
  options: INCLUDED_RICE_OPTIONS,
};

export const REGULAR_ENTREE_SIDE_GROUP: MenuModifierGroup = {
  id: "regular-entree-side",
  label: "Side Upgrade",
  required: false,
  options: REGULAR_ENTREE_SIDE_UPGRADES,
};

export const VALUE_COMBO_CHOICE_1_GROUP: MenuModifierGroup = {
  id: "value-combo-choice-1",
  label: "Choice 1",
  required: true,
  options: VALUE_COMBO_CHOICES,
};

export const VALUE_COMBO_CHOICE_2_GROUP: MenuModifierGroup = {
  id: "value-combo-choice-2",
  label: "Choice 2",
  required: true,
  options: VALUE_COMBO_CHOICES,
};

export const VALUE_COMBO_RICE_GROUP: MenuModifierGroup = {
  id: "value-combo-rice",
  label: "Rice",
  required: true,
  options: INCLUDED_RICE_OPTIONS,
};

const FAMILY_SPECIAL_GROUPS_BY_ITEM_ID: Record<string, MenuModifierGroup[]> = {
  "FS-A": [
    {
      id: "family-special-a-soup",
      label: "Soup choice",
      required: true,
      options: FAMILY_SPECIAL_SOUP_OPTIONS,
    },
    {
      id: "family-special-a-fried-rice",
      label: "Fried rice choice",
      required: true,
      options: FAMILY_SPECIAL_FRIED_RICE_OPTIONS,
    },
    {
      id: "family-special-a-entree",
      label: "Entree choice",
      required: true,
      options: FAMILY_SPECIAL_A_ENTREE_OPTIONS,
    },
    {
      id: "family-special-a-vegetable-meat",
      label: "Vegetable with meat choice",
      required: true,
      options: FAMILY_SPECIAL_VEGETABLE_MEAT_OPTIONS,
    },
  ],
  "FS-B": [
    {
      id: "family-special-b-fried-rice",
      label: "Fried rice choice",
      required: true,
      options: FAMILY_SPECIAL_FRIED_RICE_OPTIONS,
    },
    {
      id: "family-special-b-entree",
      label: "Entree choice",
      required: true,
      options: FAMILY_SPECIAL_B_ENTREE_OPTIONS,
    },
  ],
  "FS-C": [
    {
      id: "family-special-c-soup",
      label: "Soup choice",
      required: true,
      options: FAMILY_SPECIAL_SOUP_OPTIONS,
    },
    {
      id: "family-special-c-lo-mein",
      label: "Lo mein choice",
      required: true,
      options: FAMILY_SPECIAL_LO_MEIN_OPTIONS,
    },
    {
      id: "family-special-c-fried-rice",
      label: "Fried rice choice",
      required: true,
      options: FAMILY_SPECIAL_FRIED_RICE_OPTIONS,
    },
    {
      id: "family-special-c-entree-1",
      label: "Entree choice 1",
      required: true,
      options: FAMILY_SPECIAL_C_ENTREE_OPTIONS,
    },
    {
      id: "family-special-c-entree-2",
      label: "Entree choice 2",
      required: true,
      options: FAMILY_SPECIAL_C_ENTREE_OPTIONS,
    },
  ],
};

export function isSpecialtyPlatterSection(section: Pick<MenuSection, "id">) {
  return section.id === "specialty-platters";
}

export function isLunchSpecialSection(section: Pick<MenuSection, "id">) {
  return section.id === "lunch-special";
}

export function isSpecialCombinationSection(section: Pick<MenuSection, "id">) {
  return section.id === "combination-platters";
}

export function isValueComboSection(section: Pick<MenuSection, "id">) {
  return section.id === "value-combo";
}

export function isRegularEntreeSection(section: Pick<MenuSection, "id">) {
  return [
    "vegetable",
    "seafood",
    "chicken",
    "beef",
    "pork",
    "egg-foo-young",
    "diet-menu",
    "sweet-sour",
  ].includes(section.id);
}

export function getModifierGroupsForSection(section: Pick<MenuSection, "id">) {
  if (isLunchSpecialSection(section)) {
    return [LUNCH_SPECIAL_RICE_GROUP];
  }

  if (isSpecialCombinationSection(section)) {
    return [SPECIAL_COMBINATION_RICE_GROUP];
  }

  if (isValueComboSection(section)) {
    return [
      VALUE_COMBO_CHOICE_1_GROUP,
      VALUE_COMBO_CHOICE_2_GROUP,
      VALUE_COMBO_RICE_GROUP,
    ];
  }

  if (isRegularEntreeSection(section)) {
    return [REGULAR_ENTREE_SIDE_GROUP];
  }

  return [];
}

export function getModifierGroupsForItem(
  section: Pick<MenuSection, "id">,
  item: Pick<MenuItem, "id">,
) {
  if (section.id === "family-specials") {
    return FAMILY_SPECIAL_GROUPS_BY_ITEM_ID[item.id] ?? [];
  }

  return getModifierGroupsForSection(section);
}

export function getItemOptionGroup(
  item: Pick<MenuItem, "optionLabel" | "options">,
) {
  if (!item.options?.length) {
    return null;
  }

  return {
    id: ITEM_OPTION_GROUP_ID,
    label: item.optionLabel ?? "Option",
    required: true,
    options: item.options.map((option, index) => ({
      id: option.id ?? normalizeOptionId(option.label, index),
      label: option.label,
      priceDeltaCents: 0,
    })),
  } satisfies MenuModifierGroup;
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

export function formatCartModifierLabel(modifier: CartItemModifier) {
  const priceSuffix =
    modifier.priceDeltaCents > 0
      ? ` +$${(modifier.priceDeltaCents / 100).toFixed(2)}`
      : "";

  return `${modifier.groupLabel}: ${modifier.optionLabel}${priceSuffix}`;
}

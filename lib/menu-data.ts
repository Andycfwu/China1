export type MenuItemOption = {
  id?: string;
  label: string;
  price?: string;
};

export type MenuItem = {
  id: string;
  displayId?: string;
  hideId?: boolean;
  name: string;
  optionLabel?: string;
  price: string;
  spicy?: boolean;
  description?: string;
  options?: MenuItemOption[];
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
};

export const restaurantInfo = {
  name: "CHINA 1",
  tagline: "Chinese Food Take Out Restaurant",
  address: "450 S Broadway, Camden, NJ 08103",
  primaryPhone: "856-342-6828",
  otherPhones: ["856-479-1757"],
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=450%20S%20Broadway%2C%20Camden%2C%20NJ%2008103",
  hours: [
    { days: "Monday-Thursday", time: "11:00 AM - 11:00 PM" },
    { days: "Friday-Saturday", time: "11:00 AM - 12:00 AM" },
    { days: "Sunday", time: "6:00 PM - 12:00 AM" },
  ],
};

function specialtyPrice(
  plain:
    | string
    | {
        small: string;
        large: string;
      },
  fries: string,
  porkChicken: string,
  beefShrimpLoMein: string,
) {
  const plainOptions =
    typeof plain === "string"
      ? [["Plain", plain]]
      : [
          ["Plain Small", plain.small],
          ["Plain Large", plain.large],
        ];

  return [
    ...plainOptions,
    ["French Fries", fries],
    ["Plain Fried Rice", fries],
    ["Fried Bananas", fries],
    ["Pork Fried Rice", porkChicken],
    ["Chicken Fried Rice", porkChicken],
    ["Beef Fried Rice", beefShrimpLoMein],
    ["Shrimp Fried Rice", beefShrimpLoMein],
    ["Plain Lo Mein", beefShrimpLoMein],
  ]
    .map(([label, price]) => `${label} $${price}`)
    .join(" / ");
}

function flavorOptions(...labels: string[]): MenuItemOption[] {
  return labels.map((label) => ({
    id: label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    label,
  }));
}

export const menuSections: MenuSection[] = [
  {
    id: "specialty-platters",
    title: "Specialty Platters",
    note: "Choose one exact platter option. Fried Bananas, rice, fries, and lo mein choices are separated for kitchen clarity.",
    items: [
      { id: "A", name: "Honey Chicken Wings (8 pcs)", price: specialtyPrice("7.35", "9.65", "10.65", "11.25") },
      { id: "B", name: "Buffalo Chicken Wings (8 pcs)", price: specialtyPrice("7.35", "9.65", "10.65", "11.25"), spicy: true },
      { id: "C", name: "Fried Chicken Wings (4 Whole)", price: specialtyPrice("6.50", "8.75", "9.75", "10.25") },
      { id: "D", name: "Wings w. General Tso's Sauce (8 pcs)", price: specialtyPrice("7.35", "9.65", "10.65", "11.25"), spicy: true },
      { id: "E", name: "B-B-Q Wings (8 pcs)", price: specialtyPrice("7.35", "9.65", "10.65", "11.25") },
      { id: "F", name: "Wings w. Garlic Sauce (8 pcs)", price: specialtyPrice("7.35", "9.65", "10.65", "11.25"), spicy: true },
      { id: "G", name: "Fried Jumbo Shrimp (5)", price: specialtyPrice("7.25", "9.25", "10.25", "11.25") },
      { id: "H", name: "Fried Shrimp Basket", price: specialtyPrice("6.25", "8.25", "9.25", "10.25") },
      { id: "I", name: "Old Bay Shrimp", price: specialtyPrice("6.25", "8.25", "9.25", "10.75") },
      { id: "J", name: "Crispy Battered Shrimp", price: specialtyPrice("6.25", "8.25", "9.25", "10.25") },
      { id: "K", name: "Chicken Fingers (4)", price: specialtyPrice("6.25", "8.25", "9.25", "9.99") },
      { id: "L", name: "Popcorn Chicken", price: specialtyPrice({ small: "5.95", large: "8.50" }, "8.25", "9.25", "9.99") },
      { id: "M", name: "Chicken on Sticks (3)", price: specialtyPrice("5.95", "7.95", "8.95", "9.95") },
      { id: "N", name: "Shrimp on Sticks (3)", price: specialtyPrice("5.95", "7.95", "8.95", "9.95") },
      { id: "O", name: "Fried Krab Stick (4)", price: specialtyPrice("5.95", "7.95", "8.95", "9.95") },
      { id: "P", name: "Flounder Fish Sandwich", price: specialtyPrice("6.25", "8.25", "9.25", "10.25") },
      { id: "Q", name: "Fried Scallop (10)", price: specialtyPrice("6.25", "8.25", "9.25", "10.25") },
      { id: "R", name: "Spare Rib Tips", price: specialtyPrice({ small: "6.50", large: "9.25" }, "8.50", "9.50", "10.50") },
      { id: "S", name: "Chicken Nugget (10)", price: specialtyPrice("6.25", "8.25", "9.25", "9.99") },
      { id: "T", name: "Fried Chicken Gizzards", price: specialtyPrice("6.25", "8.25", "9.25", "9.99") },
      { id: "U", name: "Boneless Spare Ribs", price: specialtyPrice({ small: "8.75", large: "13.95" }, "10.75", "11.75", "12.75") },
      { id: "V", name: "B-B-Q Spare Ribs", price: specialtyPrice({ small: "8.75", large: "13.95" }, "10.75", "11.75", "12.75") },
    ],
  },
  {
    id: "appetizers",
    title: "Appetizers",
    items: [
      { id: "1", name: "Beef Roll", price: "$2.35" },
      { id: "2", name: "Spring Rolls (2) (Vegetable)", price: "$3.15" },
      { id: "3", name: "Pork Egg Roll", price: "$2.15" },
      { id: "4", name: "Vegetable Egg Roll", price: "$2.15" },
      { id: "5", name: "Shrimp Egg Roll", price: "$2.35" },
      { id: "6", name: "Pizza Roll", price: "$2.25" },
      { id: "7", name: "Onion Rings (10)", price: "$4.75" },
      { id: "8", name: "French Fries", price: "Sm $2.45 / Lg $3.95" },
      { id: "9", name: "Cheese Fries", price: "Sm $3.25 / Lg $5.50" },
      { id: "10", name: "Chinese Donuts (10)", price: "$4.75" },
      { id: "11", name: "Fried Wonton (10) with Sauce", price: "$4.95" },
      { id: "12", name: "Mozzarella Sticks (5 pcs)", price: "$5.25" },
      {
        id: "13",
        name: "Steamed or Fried Dumplings (8)",
        price: "$7.50",
        options: [
          { id: "steamed", label: "Steamed" },
          { id: "fried", label: "Fried" },
        ],
      },
      { id: "14", name: "Krab Rangoons (6)", price: "$5.95" },
      { id: "15", name: "Cold Noodle w. Sesame Sauce", price: "$7.99", spicy: true },
      { id: "16", name: "Cheese Steak", price: "$6.25" },
      { id: "17", name: "Sesame Ball (10 pcs)", price: "$4.99" },
      { id: "18", name: "Cheese Burger", price: "$4.50" },
      { id: "19", name: "Funnel Cake", price: "$2.75" },
      { id: "20", name: "Funnel Fries", price: "$2.75" },
      { id: "21", name: "Fried Bananas", price: "Sm $3.50 / Lg $5.75" },
      {
        id: "22",
        name: "Pu Pu Platter",
        price: "$15.99",
        description:
          "Shrimp egg roll (1), Egg roll (1), Chicken stick (2), Spare ribs (2), Wing (2), Krab rangoon (2), Jumbo shrimp (2), Sesame ball (2).",
      },
    ],
  },
  {
    id: "soup",
    title: "Soup",
    note: "With crispy noodle.",
    items: [
      { id: "23", name: "Wonton Soup", price: "Pt $3.25 / Qt $5.95" },
      { id: "24", name: "Wonton Egg Drop Soup", price: "Pt $3.75 / Qt $6.50" },
      { id: "25", name: "Egg Drop Soup", price: "Pt $3.25 / Qt $5.95" },
      {
        id: "26",
        name: "Chicken Noodle or Rice Soup",
        price: "Pt $3.25 / Qt $5.95",
        options: [
          { id: "noodle", label: "Noodle" },
          { id: "rice", label: "Rice" },
        ],
      },
      { id: "27", name: "Hot and Sour Soup", price: "Pt $3.75 / Qt $6.75", spicy: true },
      { id: "28", name: "House Special Soup", price: "$6.95" },
      { id: "29", name: "Vegetable Soup", price: "$5.25" },
      { id: "30", name: "Seafood Soup", price: "$6.95" },
    ],
  },
  {
    id: "lo-mein",
    title: "Lo Mein",
    note: "Soft noodles.",
    items: [
      { id: "31", name: "Plain Lo Mein", price: "Pt $6.75 / Qt $8.25" },
      { id: "32", name: "Vegetable Lo Mein", price: "Pt $6.75 / Qt $8.25" },
      { id: "33", name: "Crawfish Lo Mein", price: "Pt $7.25 / Qt $10.25" },
      { id: "34", name: "Roast Pork Lo Mein", price: "Pt $7.25 / Qt $10.25" },
      { id: "35", name: "Chicken Lo Mein", price: "Pt $7.25 / Qt $10.25" },
      { id: "36", name: "Beef Lo Mein", price: "Pt $7.50 / Qt $10.75" },
      { id: "37", name: "Shrimp Lo Mein", price: "Pt $7.50 / Qt $10.75" },
      { id: "38", name: "House Special Lo Mein", price: "Pt $7.95 / Qt $10.95" },
    ],
  },
  {
    id: "chow-mei-fun",
    title: "Chow Mei Fun",
    note: "Thin white noodles. Per order.",
    items: [
      { id: "39", name: "Vegetable Chow Mei Fun", price: "$9.95" },
      { id: "40", name: "Roast Pork Chow Mei Fun", price: "$10.95" },
      { id: "41", name: "Chicken Chow Mei Fun", price: "$10.95" },
      { id: "42", name: "Beef Chow Mei Fun", price: "$10.95" },
      { id: "43", name: "Shrimp Chow Mei Fun", price: "$10.95" },
      { id: "44", name: "House Special Chow Mei Fun", price: "$11.95" },
      { id: "45", name: "Singapore Chow Mei Fun", price: "$11.95", spicy: true },
    ],
  },
  {
    id: "fried-rice",
    title: "Fried Rice",
    items: [
      { id: "46", name: "White Rice", price: "Pt $2.99 / Qt $5.99" },
      { id: "47", name: "Brown Rice", price: "Pt $2.99 / Qt $5.99" },
      { id: "48", name: "Plain Fried Rice", price: "Pt $4.75 / Qt $7.75" },
      { id: "49", name: "Vegetable Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "50", name: "Ham Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "51", name: "Crawfish Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "52", name: "Roast Pork Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "53", name: "Chicken Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "54", name: "Beef Fried Rice", price: "Pt $6.25 / Qt $10.50" },
      { id: "55", name: "Shrimp Fried Rice", price: "Pt $6.25 / Qt $10.50" },
      { id: "56", name: "Krabmeat Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "57", name: "House Special Fried Rice", price: "Pt $6.25 / Qt $10.50" },
      { id: "58", name: "Yang Chow Fried Rice", price: "Pt $6.95 / Qt $10.95" },
    ],
  },
  {
    id: "vegetable",
    title: "Vegetable",
    note: "With white rice.",
    items: [
      { id: "59", name: "Plain Broccoli", price: "Pt $6.50 / Qt $9.25" },
      { id: "60", name: "Mixed Vegetables", price: "Pt $6.50 / Qt $9.25" },
      { id: "61", name: "Ma Po Tofu", price: "$10.95", spicy: true },
      { id: "62", name: "Home Style Bean Curd", price: "$10.95" },
      { id: "63", name: "General Tso's Tofu", price: "$10.95", spicy: true },
    ],
  },
  {
    id: "seafood",
    title: "Seafood",
    note: "With white rice.",
    items: [
      { id: "64", name: "Shrimp with Lobster Sauce (Soup)", price: "Pt $8.50 / Qt $12.95" },
      { id: "65", name: "Shrimp with Broccoli", price: "Pt $8.50 / Qt $12.95" },
      { id: "66", name: "Shrimp with Mixed Vegetable", price: "Pt $8.50 / Qt $12.95" },
      { id: "67", name: "Shrimp with Mushroom", price: "Pt $8.50 / Qt $12.95" },
      { id: "68", name: "Shrimp with Garlic Sauce", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "69", name: "Hunan Shrimp", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "70", name: "Szechuan Shrimp", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "71", name: "General Tso's Shrimp", price: "Pt $9.35 / Qt $13.95", spicy: true },
      { id: "72", name: "Hot & Spicy Shrimp", price: "$13.95", spicy: true },
    ],
  },
  {
    id: "chicken",
    title: "Chicken",
    note: "With white rice.",
    items: [
      { id: "73", name: "Chicken with Green Pepper & Onion", price: "Pt $8.25 / Qt $12.75" },
      { id: "74", name: "Chicken with Black Bean Sauce", price: "Pt $8.25 / Qt $12.75" },
      { id: "75", name: "Chicken with Mixed Vegetable", price: "Pt $8.25 / Qt $12.75" },
      { id: "76", name: "Chicken with Broccoli", price: "Pt $8.25 / Qt $12.75" },
      { id: "77", name: "Chicken with Garlic Sauce", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "78", name: "Szechuan Chicken", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "79", name: "Hunan Chicken", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "80", name: "Bourbon Chicken", price: "Pt $8.25 / Qt $12.75" },
      { id: "81", name: "Curry Chicken with Onion", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "82", name: "Moo Goo Gai Pan", price: "Pt $8.25 / Qt $12.75" },
      { id: "83", name: "Honey Chicken", price: "Pt $8.25 / Qt $12.75" },
      { id: "84", name: "Chicken with Cashew Nuts", price: "Pt $8.25 / Qt $12.75" },
      { id: "85", name: "Kung Pao Chicken", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "86", name: "Black Pepper Chicken", price: "Pt $8.50 / Qt $12.95" },
      { id: "87", name: "Grand Style Chicken", price: "Pt $8.50 / Qt $12.95" },
      { id: "88", name: "General Tso's Chicken", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "89", name: "Sesame Chicken", price: "Pt $8.50 / Qt $12.95" },
      { id: "90", name: "Orange Chicken", price: "Pt $8.50 / Qt $12.95", spicy: true },
    ],
  },
  {
    id: "beef",
    title: "Beef",
    note: "With white rice.",
    items: [
      { id: "91", name: "Pepper Steak with Onion", price: "Pt $8.50 / Qt $12.95" },
      { id: "92", name: "Beef with Broccoli", price: "Pt $8.50 / Qt $12.95" },
      { id: "93", name: "Beef with Mixed Vegetables", price: "Pt $8.50 / Qt $12.95" },
      { id: "94", name: "Szechuan Beef", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "95", name: "Beef with Mushroom", price: "Pt $8.50 / Qt $12.95" },
      { id: "96", name: "Beef with Black Bean Sauce", price: "Pt $8.50 / Qt $12.95" },
      { id: "97", name: "Beef with Garlic Sauce", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "98", name: "Hunan Beef", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "99", name: "Spicy Orange Beef", price: "Pt $9.35 / Qt $13.95", spicy: true },
      { id: "100", name: "Mongolian Beef", price: "$13.95", spicy: true },
    ],
  },
  {
    id: "pork",
    title: "Pork",
    note: "With white rice.",
    items: [
      { id: "101", name: "Roast Pork with Broccoli", price: "Pt $8.25 / Qt $12.75" },
      { id: "102", name: "Roast Pork with Mushroom", price: "Pt $8.25 / Qt $12.75" },
      { id: "103", name: "Szechuan Pork", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "104", name: "Roast Pork with Garlic Sauce", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "105", name: "Roast Pork with Mixed Vegetable", price: "Pt $8.25 / Qt $12.75" },
      { id: "106", name: "Roast Pork Hunan Style", price: "Pt $8.25 / Qt $12.75", spicy: true },
    ],
  },
  {
    id: "egg-foo-young",
    title: "Egg Foo Young",
    note: "With white rice.",
    items: [
      { id: "107", name: "Plain Egg Foo Young (No Meat, No Vegetable)", price: "Pt $8.25 / Qt $10.25" },
      { id: "108", name: "Roast Pork Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "109", name: "Chicken Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "110", name: "Shrimp Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "111", name: "Beef Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "112", name: "Vegetable Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "113", name: "House Special Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "114", name: "Crawfish Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "115", name: "Ham Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
    ],
  },
  {
    id: "diet-menu",
    title: "Diet Menu",
    note: "No salt, no oil. Sauce on the side & white rice.",
    items: [
      { id: "116", name: "Steamed Broccoli", price: "Pt $6.50 / Qt $9.25" },
      { id: "117", name: "Steamed Shrimp w. Broccoli", price: "Pt $8.50 / Qt $12.95" },
      { id: "118", name: "Steamed Chicken w. Mixed Vegetable", price: "Pt $8.25 / Qt $12.75" },
    ],
  },
  {
    id: "sweet-sour",
    title: "Sweet & Sour",
    note: "With white rice.",
    items: [
      { id: "119", name: "Sweet & Sour Chicken", price: "Pt $8.25 / Qt $12.75" },
      { id: "120", name: "Sweet & Sour Shrimp", price: "Pt $8.25 / Qt $12.95" },
    ],
  },
  {
    id: "yat-gaw-mein",
    title: "Yat Gaw Mein",
    note: "Thick noodles & gravy. Per order.",
    items: [
      { id: "121", name: "Plain Yat (w. Onion)", price: "$6.95" },
      { id: "122", name: "Pork Yat (w. Onion)", price: "$8.25" },
      { id: "123", name: "Chicken Yat (w. Vegetable)", price: "$8.25" },
      { id: "124", name: "Beef Yat (w. Vegetable)", price: "$8.25" },
      { id: "125", name: "Shrimp Yat (w. Vegetable)", price: "$8.25" },
    ],
  },
  {
    id: "lunch-special",
    title: "Lunch Special",
    note: "Served Monday to Saturday, 11:00 AM-3:00 PM. With fried rice or white rice and can soda. All lunch specials are $8.99.",
    items: [
      { id: "L1", name: "Bar-B-Q Spare Rib Tip", price: "$8.99" },
      { id: "L2", name: "Roast Pork Lo Mein", price: "$8.99" },
      { id: "L3", name: "Chicken Egg Foo Young", price: "$8.99" },
      { id: "L4", name: "Chicken with Broccoli", price: "$8.99" },
      { id: "L5", name: "Beef with Broccoli", price: "$8.99" },
      { id: "L6", name: "Sweet and Sour Chicken", price: "$8.99" },
      { id: "L7", name: "Pepper Steak with Onion", price: "$8.99" },
      { id: "L8", name: "Chicken with Mixed Vegetable", price: "$8.99" },
      { id: "L9", name: "Shrimp with Lobster Sauce (Soup)", price: "$8.99" },
      { id: "L10", name: "Shrimp with Broccoli", price: "$8.99" },
      { id: "L11", name: "Hunan Chicken", price: "$8.99", spicy: true },
      { id: "L12", name: "General Tso's Chicken", price: "$8.99", spicy: true },
      { id: "L13", name: "Sesame Chicken", price: "$8.99" },
      { id: "L14", name: "Orange Chicken", price: "$8.99", spicy: true },
      { id: "L15", name: "Chicken with Garlic Sauce", price: "$8.99", spicy: true },
      { id: "L16", name: "Kung Pao Chicken", price: "$8.99", spicy: true },
      { id: "L17", name: "Honey Chicken", price: "$8.99" },
      { id: "L18", name: "Bourbon Chicken", price: "$8.99" },
      { id: "L19", name: "Chicken on Stick", price: "$8.99" },
      { id: "L20", name: "Black Pepper Chicken", price: "$8.99" },
      { id: "L21", name: "Grand Style Chicken", price: "$8.99" },
      { id: "L22", name: "Szechuan Chicken", price: "$8.99", spicy: true },
    ],
  },
  {
    id: "combination-platters",
    title: "Combination Platters",
    note: "With fried rice or white rice and roast pork egg roll. All combination platters are $10.99.",
    items: [
      { id: "C1", name: "Bar-B-Q Spare Rib Tip", price: "$10.99" },
      { id: "C2", name: "Chicken Lo Mein", price: "$10.99" },
      { id: "C3", name: "Roast Pork Egg Foo Young", price: "$10.99" },
      { id: "C4", name: "Chicken with Broccoli", price: "$10.99" },
      { id: "C5", name: "Beef with Broccoli", price: "$10.99" },
      { id: "C6", name: "Sweet and Sour Chicken", price: "$10.99" },
      { id: "C7", name: "Pepper Steak with Onion", price: "$10.99" },
      { id: "C8", name: "Chicken with Mixed Vegetable", price: "$10.99" },
      { id: "C9", name: "Shrimp with Lobster Sauce (Soup)", price: "$10.99" },
      { id: "C10", name: "Shrimp with Broccoli", price: "$10.99" },
      { id: "C11", name: "Hunan Chicken", price: "$10.99", spicy: true },
      { id: "C12", name: "General Tso's Chicken", price: "$10.99", spicy: true },
      { id: "C13", name: "Sesame Chicken", price: "$10.99" },
      { id: "C14", name: "Orange Chicken", price: "$10.99", spicy: true },
      { id: "C15", name: "Chicken with Garlic Sauce", price: "$10.99", spicy: true },
      { id: "C16", name: "Boneless Spare Ribs", price: "$10.99" },
      { id: "C17", name: "B-B-Q Spare Ribs", price: "$10.99" },
      { id: "C18", name: "Honey Chicken", price: "$10.99" },
      { id: "C19", name: "Bourbon Chicken", price: "$10.99" },
      { id: "C20", name: "Black Pepper Chicken", price: "$10.99" },
      { id: "C21", name: "Grand Style Chicken", price: "$10.99" },
      { id: "C22", name: "Roast Pork with Mixed Vegetable", price: "$10.99" },
      { id: "C23", name: "Chicken with Cashew Nuts", price: "$10.99" },
      { id: "C24", name: "Szechuan Chicken", price: "$10.99", spicy: true },
    ],
  },
  {
    id: "value-combo",
    title: "$9.99 Value Combo",
    note: "Available 11:00 AM-5:00 PM. Pick any 2 with fried rice or white rice and 1 can soda.",
    items: [
      {
        id: "VC1",
        displayId: "VC",
        name: "Pick Any 2 Value Combo",
        price: "$9.99",
        description:
          "Choose two items, rice, and a can soda. The two choices may be the same unless the restaurant asks otherwise.",
      },
    ],
  },
  {
    id: "chefs-specialties",
    title: "Chef's Specialties",
    note: "Served with white rice.",
    items: [
      {
        id: "S1",
        name: "General Tso's Chicken",
        price: "Sm $8.50 / Lg $12.95",
        spicy: true,
        description: "Chicken quickly stir-fried with house special sauce.",
      },
      {
        id: "S2",
        name: "Sesame Chicken",
        price: "Sm $8.50 / Lg $12.95",
        description:
          "Chunks of chicken marinated, quick fried until crisp & blended with sesame sauce, sprinkled with sesame seeds.",
      },
      { id: "S3", name: "Orange Chicken", price: "Sm $8.50 / Lg $12.95", spicy: true },
      { id: "S4", name: "Orange Beef", price: "Sm $9.35 / Lg $13.95", spicy: true },
      { id: "S5", name: "General Tso's Shrimp", price: "Sm $9.35 / Lg $13.95", spicy: true },
      {
        id: "S6",
        name: "Four Seasons",
        price: "$15.99",
        description:
          "A delicious combination of meat, chicken breast, jumbo shrimp, sliced beef & roast pork sauteed with vegetable in tasty brown sauce.",
      },
      {
        id: "S7",
        name: "Happy Family",
        price: "$15.95",
        description:
          "Krab meat, chicken, beef, roast pork, jumbo shrimp & mixed vegetable in brown sauce.",
      },
      {
        id: "S8",
        name: "Triple Delight",
        price: "$15.99",
        spicy: true,
        description: "Jumbo shrimp, beef, chicken with mixed vegetable with garlic sauce.",
      },
      {
        id: "S9",
        name: "Seafood Delight",
        price: "$15.95",
        description:
          "2 krabmeat, 6 pcs jumbo shrimp, 5 scallop w. mixed vegetables in special sauce.",
      },
      {
        id: "S10",
        name: "Double Delight w. Broccoli",
        price: "$15.99",
        description: "Jumbo shrimp & scallop with light sauce.",
      },
      { id: "S11", name: "Boneless Chicken", price: "$13.95" },
      { id: "S12", name: "Lemon Chicken", price: "$13.95" },
      {
        id: "S13",
        name: "Hawaii Five \"O\"",
        price: "$15.95",
        description:
          "Shrimp, scallops, chicken, beef, roast pork w. broccoli and baby corn, green peppers, mushroom w. garlic sauce.",
      },
      {
        id: "S14",
        name: "Scallop & Beef w. Garlic Sauce",
        price: "$15.95",
        spicy: true,
      },
      {
        id: "S15",
        name: "Dragon & Phoenix",
        price: "$15.99",
        spicy: true,
        description:
          "General Tso's chicken on one side and shrimp, vegetables on other side.",
      },
      {
        id: "S16",
        name: "Shrimp and Roast Pork Hunan Style",
        price: "$15.99",
        spicy: true,
      },
    ],
  },
  {
    id: "drinks",
    title: "Drinks",
    note: "Choose one exact flavor where shown.",
    items: [
      {
        id: "DR-1",
        name: "2 Liter Soda",
        optionLabel: "Flavor",
        options: flavorOptions(
          "Canada Dry",
          "Pepsi",
          "Orange",
          "Coca-Cola",
          "Sprite",
          "Tahitian Treat",
        ),
        price: "$4.00",
      },
      {
        id: "DR-2",
        name: "Homemade Drink",
        optionLabel: "Flavor",
        options: flavorOptions(
          "Iced Tea",
          "Fruit Punch",
          "Lemonade",
          "Pink Lemonade",
          "Iced Blue",
        ),
        price: "$2.00",
      },
      {
        id: "DR-3",
        name: "Bottle Soda",
        optionLabel: "Flavor",
        options: flavorOptions(
          "Pepsi",
          "Coca-Cola",
          "Sprite",
          "Orange",
          "Brisk Iced Tea",
          "Mountain Dew",
          "Grape Soda",
          "Tahitian Treat",
          "Canada Dry",
          "Peach",
          "Pineapple",
          "Vanilla Cream",
        ),
        price: "$2.50",
      },
      {
        id: "DR-4",
        name: "Arizona",
        optionLabel: "Flavor",
        options: flavorOptions(
          "Sweet Tea",
          "Pineapple",
          "Raspberry",
          "Fruit Punch",
          "Iced Tea",
          "Mucho Mango",
          "Watermelon",
          "Kiwi Strawberry",
          "Green Tea",
        ),
        price: "$1.25",
      },
      {
        id: "DR-5",
        name: "Can Soda",
        optionLabel: "Flavor",
        options: flavorOptions(
          "Pepsi",
          "Coca-Cola",
          "Sprite",
          "Orange",
          "Ginger Ale",
          "Dr Pepper",
          "Mountain Dew",
          "Grape Soda",
          "Diet Coke",
          "Diet Pepsi",
          "Brisk Iced Tea",
        ),
        price: "$1.00",
      },
      { id: "DR-6", name: "Red Bull 8.4 fl oz", price: "$2.50" },
      {
        id: "DR-7",
        name: "Red Bull Sugar Free 8.4 fl oz",
        price: "$2.50",
      },
      { id: "DR-8", name: "Red Bull 12 fl oz", price: "$3.50" },
      { id: "DR-9", name: "Monster 16 fl oz", price: "$2.50" },
    ],
  },
  {
    id: "family-specials",
    title: "Family Specials",
    note: "Family Specials and Game Day Combo. Required choices are selected when ordering online.",
    items: [
      {
        id: "FS-A",
        name: "Family Special A",
        price: "$39.99",
        description:
          "Includes 3 Roast Pork Egg Roll; 1 Qt Soup; 1 Qt Fried Rice; 1 Qt entree choice; 1 Pt Vegetable with Meat; 1 Qt White Rice free. Feeds 3-4 people.",
      },
      {
        id: "FS-B",
        name: "Family Special B",
        price: "$39.99",
        description:
          "Includes 2 Beef Roll; 1 Qt Fried Rice; 1 Qt entree choice; 8 whole Chicken Wings; 2 Liter Soda; 1 Qt White Rice free. Feeds 3-4 people. Add preferred soda flavor in item notes.",
      },
      {
        id: "FS-C",
        name: "Family Special C",
        price: "$69.99",
        description:
          "Includes 5 Shrimp Egg Roll; 10 whole Chicken Wings; 1 Qt Soup; 1 Qt Lo Mein; 1 Qt Fried Rice; choice of 2 Pt entrees; 2 Liter Soda; 1 Qt White Rice free. Feeds 5-6 people. Add preferred soda flavor in item notes.",
      },
      {
        id: "FS-D",
        name: "Family Special D",
        price: "$69.99",
        description:
          "Includes 1 Pt General Tso's Chicken; 1 Pt Sesame Chicken; 1 Pt Boneless Spare Ribs; 1 Pt Roast Pork Lo Mein; 1 Pt Chicken with Garlic Sauce; 1 Pt Chicken Fried Rice; 1 Pt Honey Chicken; 7 Roast Pork Egg Roll; 2 Liter Soda. Add preferred soda flavor in item notes.",
      },
      {
        id: "FS-E",
        name: "Family Special E",
        price: "$49.99",
        description:
          "Includes 4 Shrimp Egg Roll; 1 Qt Chicken Lo Mein; 1 Qt Roast Pork Fried Rice; 13 whole Chicken Wings; 2 Liter Soda. Feeds 3-4 people. Add preferred soda flavor in item notes.",
      },
      {
        id: "GD-F",
        name: "Game Day Combo F",
        price: "$49.99",
        description:
          "Includes Fried Shrimp Basket; 1 Qt French Fries; 1 Qt Spare Rib Tip; 1 Sm Fried Bananas; 1 Chicken on Stick order; 1 Chinese Donuts order; Chicken Gizzards; 8 whole Chicken Wings.",
      },
    ],
  },
];

export const partyTraySections: MenuSection[] = [
  {
    id: "party-trays",
    title: "Party Trays / Catering Available",
    note: "Party Featured Menu from the pink flyer. Hot & spicy items are marked.",
    items: [
      { id: "P1", name: "General Tso's Chicken", price: "$47.25", spicy: true },
      { id: "P2", name: "Beef with Broccoli", price: "$47.25" },
      { id: "P3", name: "Chicken Lo Mein", price: "$37.95" },
      { id: "P4", name: "Roast Pork Fried Rice", price: "$34.45" },
      { id: "P5", name: "Sweet & Sour Chicken", price: "$46.50" },
      { id: "P6", name: "Shrimp with Mixed Vegetables", price: "$47.25" },
      { id: "P7", name: "Singapore Chow Mei Fun", price: "$42.95", spicy: true },
      { id: "P8", name: "Chicken with Garlic Sauce", price: "$46.50", spicy: true },
      { id: "P9", name: "House Special Fried Rice", price: "$37.75" },
      { id: "P10", name: "General Tso's Tofu", price: "$39.95", spicy: true },
      { id: "P11", name: "Bourbon Chicken", price: "$46.95" },
      { id: "P12", name: "Hunan Chicken", price: "$46.95", spicy: true },
      { id: "P13", name: "House Special Lo Mein", price: "$39.95" },
      { id: "P14", name: "Crab Rangoon", price: "30 $26.95 / 50 $42.95 / 80 $63.95" },
      { id: "P15", name: "Steamed Dumpling", price: "20 $17.95 / 30 $23.95 / 40 $29.95" },
      { id: "P16", name: "Chicken on Stick", price: "15 $26.95 / 20 $33.95 / 30 $47.95" },
      { id: "P17", name: "Egg Roll", price: "20 $38.95 / 40 $68.95 / 60 $99.99" },
    ],
  },
];

export const orderableMenuSections: MenuSection[] = [
  ...menuSections,
  ...partyTraySections,
];

export const featuredCategories = [
  "Specialty Platters",
  "$9.99 Value Combo",
  "Family Specials",
  "Chef's Specialties",
  "Combination Platters",
  "Party Trays",
];

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

const photoEdgeNote =
  "Some prices/items near glare or the photo edge should be confirmed with the restaurant before publishing.";

export const menuSections: MenuSection[] = [
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
      { id: "L14", name: "Chicken with Garlic Sauce", price: "$8.99", spicy: true },
      { id: "L15", name: "Kung Po Chicken", price: "$8.99", spicy: true },
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
          "Chunks of chicken marinated quick fried until crisp & blended with sesame sauce, sprinkled with sesame seeds.",
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
        description:
          "Jumbo shrimp, beef, chicken with mixed vegetable with garlic sauce.",
        spicy: true,
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
    id: "combination-platters",
    title: "Combination Platters",
    note: "With fried rice or white rice and roast pork egg roll. All visible combination platters are $10.99.",
    items: [
      { id: "C1", name: "Bar-B-Q Spare Rib Tip", price: "$10.99" },
      { id: "C2", name: "Chicken Lo Mein", price: "$10.99" },
      { id: "C3", name: "Roast Pork Egg Foo Young", price: "$10.99" },
      { id: "C4", name: "Chicken with Broccoli", price: "$10.99" },
      { id: "C5", name: "Beef with Broccoli", price: "$10.99" },
      { id: "C6", name: "Roast Pork With Mixed Vegetable", price: "$10.99" },
      { id: "C7", name: "Sweet and Sour Chicken", price: "$10.99" },
      { id: "C8", name: "Pepper Steak with Onion", price: "$10.99" },
      { id: "C9", name: "Chicken with Mixed Vegetable", price: "$10.99" },
      { id: "C10", name: "Shrimp with Lobster Sauce (Soup)", price: "$10.99" },
      { id: "C11", name: "Shrimp with Broccoli", price: "$10.99" },
      { id: "C12", name: "Hunan Chicken", price: "$10.99", spicy: true },
      { id: "C13", name: "General Tso's Chicken", price: "$10.99", spicy: true },
      { id: "C14", name: "Sesame Chicken", price: "$10.99" },
      { id: "C15", name: "Chicken with Garlic Sauce", price: "$10.99", spicy: true },
      { id: "C16", name: "Kung Po Chicken", price: "$10.99", spicy: true },
      { id: "C17", name: "Chicken With Cashew Nuts", price: "$10.99" },
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
  {
    id: "appetizers",
    title: "Appetizers",
    note: photoEdgeNote,
    items: [
      { id: "1", name: "Beef Roll", price: "$2.25" },
      { id: "2", name: "Spring Rolls (2) (Vegetable)", price: "$3.15" },
      { id: "3", name: "Pork Egg Roll", price: "$2.15" },
      { id: "4", name: "Vegetable Egg Roll", price: "$2.15" },
      { id: "5", name: "Shrimp Egg Roll", price: "$2.35" },
      { id: "6", name: "Onion Rings (10)", price: "$4.75" },
      { id: "7", name: "French Fries", price: "Sm $2.45 / Lg $3.95" },
      { id: "8", name: "Cheese Fries", price: "Sm $3.25 / Lg $5.50" },
      { id: "9", name: "Chinese Donuts (10)", price: "$4.75" },
      { id: "10", name: "Fried Wonton (10) with Sauce", price: "$4.95" },
      { id: "11", name: "Mozzarella Sticks (5 pcs)", price: "$5.25" },
      {
        id: "12",
        name: "Steamed or Fried Dumplings (8)",
        price: "$7.50",
        options: [
          { id: "steamed", label: "Steamed" },
          { id: "fried", label: "Fried" },
        ],
      },
      { id: "13", name: "Krab Rangoons (8)", price: "$7.99" },
      { id: "14", name: "Cold Noodle w. Sesame Sauce", price: "$7.99", spicy: true },
      { id: "15", name: "Cheese Steak", price: "$6.25" },
      { id: "16", name: "Sesame Ball (10 pcs)", price: "$4.99" },
      { id: "17", name: "Cheese Burger", price: "$3.50" },
      { id: "18", name: "Chicken Stick", price: "$2.25" },
      { id: "19", name: "Fried Bananas", price: "Sm $3.50 / Lg $5.75" },
      {
        id: "20",
        name: "Pu Pu Platter",
        price: "$15.99",
        description:
          "Shrimp egg roll (1), Egg roll (1), Chicken stick (2), Spare ribs (2), Wing (2), Krab rangoon (2), Jumbo shrimp (2), Sesame ball (2).",
      },
      { id: "funnel-cake", hideId: true, name: "Funnel Cake", price: "$2.25" },
      { id: "pizza-roll", hideId: true, name: "Pizza Roll", price: "$2.00" },
    ],
  },
  {
    id: "lo-mein",
    title: "Lo Mein",
    note: "Soft noodles.",
    items: [
      { id: "29", name: "Plain Lo Mein", price: "Pt $6.75 / Qt $8.25" },
      { id: "30", name: "Vegetable Lo Mein", price: "Pt $6.75 / Qt $8.25" },
      { id: "31", name: "Roast Pork Lo Mein", price: "Pt $7.25 / Qt $10.25" },
      { id: "32", name: "Chicken Lo Mein", price: "Pt $7.25 / Qt $10.25" },
      { id: "33", name: "Beef Lo Mein", price: "Pt $7.50 / Qt $10.75" },
      { id: "34", name: "Shrimp Lo Mein", price: "Pt $7.50 / Qt $10.75" },
      { id: "35", name: "House Special Lo Mein", price: "Pt $7.95 / Qt $10.99" },
    ],
  },
  {
    id: "chow-mei-fun",
    title: "Chow Mei Fun",
    note: "Thin white noodles.",
    items: [
      { id: "36", name: "Vegetable Chow Mei Fun", price: "$9.95" },
      { id: "37", name: "Chicken Chow Mei Fun", price: "$10.95" },
      { id: "38", name: "Roast Pork Chow Mei Fun", price: "$10.95" },
      { id: "39", name: "Beef Chow Mei Fun", price: "$10.95" },
      { id: "40", name: "Shrimp Chow Mei Fun", price: "$10.95" },
      { id: "41", name: "House Special Chow Mei Fun", price: "$11.95" },
      { id: "42", name: "Singapore Chow Mei Fun", price: "$11.95", spicy: true },
    ],
  },
  {
    id: "fried-rice",
    title: "Fried Rice",
    note: photoEdgeNote,
    items: [
      { id: "43", name: "White Rice", price: "Pt $2.99 / Qt $5.99" },
      { id: "44", name: "Brown Rice", price: "Pt $2.99 / Qt $5.99" },
      { id: "45", name: "Plain Fried Rice", price: "Pt $4.75 / Qt $7.75" },
      { id: "46", name: "Krabmeat Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "47", name: "Roast Pork Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "48", name: "Chicken Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "49", name: "Beef Fried Rice", price: "Pt $6.25 / Qt $10.50" },
      { id: "50", name: "Shrimp Fried Rice", price: "Pt $6.25 / Qt $10.50" },
      { id: "51", name: "Vegetable Fried Rice", price: "Pt $5.95 / Qt $9.50" },
      { id: "52", name: "House Special Fried Rice", price: "Pt $6.25 / Qt $10.50" },
    ],
  },
  {
    id: "soup",
    title: "Soup",
    note: "With crispy noodle.",
    items: [
      { id: "21", name: "Wonton Soup", price: "Pt $3.25 / Qt $5.95" },
      { id: "22", name: "Wonton Egg Drop Soup", price: "Pt $3.75 / Qt $6.50" },
      { id: "23", name: "Egg Drop Soup", price: "Pt $3.25 / Qt $5.95" },
      {
        id: "24",
        name: "Chicken Noodle or Rice Soup",
        price: "Pt $3.25 / Qt $5.95",
        options: [
          { id: "noodle", label: "Noodle" },
          { id: "rice", label: "Rice" },
        ],
      },
      { id: "25", name: "Hot and Sour Soup", price: "Pt $3.75 / Qt $6.75", spicy: true },
      { id: "26", name: "House Special Soup", price: "$6.95" },
      { id: "27", name: "Vegetable Soup", price: "$5.25" },
      { id: "28", name: "Seafood Soup", price: "$6.95" },
    ],
  },
  {
    id: "specialty-platters",
    title: "Specialty Platters",
    note: "Choose one exact side / combo option from the dropdown.",
    items: [
      { id: "A", name: "Honey Chicken Wings (8 pcs)", price: "Plain $7.35 / French Fries $9.65 / Plain Fried Rice $9.65 / Pork Fried Rice $10.65 / Chicken Fried Rice $10.65 / Beef Fried Rice $11.25 / Shrimp Fried Rice $11.25 / Plain Lo Mein $11.25" },
      { id: "B", name: "Fried Chicken Wings (4 Whole)", price: "Plain $6.50 / French Fries $8.75 / Plain Fried Rice $8.75 / Pork Fried Rice $9.75 / Chicken Fried Rice $9.75 / Beef Fried Rice $10.25 / Shrimp Fried Rice $10.25 / Plain Lo Mein $10.25" },
      { id: "C", name: "Wings w. General Tso's Sauce", price: "Plain $7.35 / French Fries $9.65 / Plain Fried Rice $9.65 / Pork Fried Rice $10.65 / Chicken Fried Rice $10.65 / Beef Fried Rice $11.25 / Shrimp Fried Rice $11.25 / Plain Lo Mein $11.25" },
      { id: "D", name: "B-B-Q Wings (8 pcs)", price: "Plain $7.35 / French Fries $9.65 / Plain Fried Rice $9.65 / Pork Fried Rice $10.65 / Chicken Fried Rice $10.65 / Beef Fried Rice $11.25 / Shrimp Fried Rice $11.25 / Plain Lo Mein $11.25" },
      { id: "E", name: "Wings w. Garlic Sauce", price: "Plain $7.35 / French Fries $9.65 / Plain Fried Rice $9.65 / Pork Fried Rice $10.65 / Chicken Fried Rice $10.65 / Beef Fried Rice $11.25 / Shrimp Fried Rice $11.25 / Plain Lo Mein $11.25" },
      { id: "F", name: "Chicken Fingers (4)", price: "Plain $6.25 / French Fries $8.25 / Plain Fried Rice $8.25 / Pork Fried Rice $9.25 / Chicken Fried Rice $9.25 / Beef Fried Rice $9.99 / Shrimp Fried Rice $9.99 / Plain Lo Mein $9.99" },
      { id: "G", name: "Popcorn Chicken", price: "Plain Small $5.95 / Plain Large $8.50 / French Fries $8.25 / Plain Fried Rice $8.25 / Pork Fried Rice $9.25 / Chicken Fried Rice $9.25 / Beef Fried Rice $9.99 / Shrimp Fried Rice $9.99 / Plain Lo Mein $9.99" },
      { id: "H", name: "Chicken Stick (3)", price: "Plain $5.95 / French Fries $7.95 / Plain Fried Rice $7.95 / Pork Fried Rice $8.95 / Chicken Fried Rice $8.95 / Beef Fried Rice $9.95 / Shrimp Fried Rice $9.95 / Plain Lo Mein $9.95" },
      { id: "I", name: "Fried Krab Stick (4)", price: "Plain $5.95 / French Fries $7.95 / Plain Fried Rice $7.95 / Pork Fried Rice $8.95 / Chicken Fried Rice $8.95 / Beef Fried Rice $9.95 / Shrimp Fried Rice $9.95 / Plain Lo Mein $9.95" },
      { id: "J", name: "Flounder Fish (2 Pcs)", price: "Plain $6.25 / French Fries $8.25 / Plain Fried Rice $8.25 / Pork Fried Rice $9.25 / Chicken Fried Rice $9.25 / Beef Fried Rice $10.25 / Shrimp Fried Rice $10.25 / Plain Lo Mein $10.25" },
      { id: "K", name: "Fried Shrimp Basket", price: "Plain $6.25 / French Fries $8.25 / Plain Fried Rice $8.25 / Pork Fried Rice $9.25 / Chicken Fried Rice $9.25 / Beef Fried Rice $10.25 / Shrimp Fried Rice $10.25 / Plain Lo Mein $10.25" },
      { id: "L", name: "Fried Scallop (10)", price: "Plain $6.25 / French Fries $8.25 / Plain Fried Rice $8.25 / Pork Fried Rice $9.25 / Chicken Fried Rice $9.25 / Beef Fried Rice $10.25 / Shrimp Fried Rice $10.25 / Plain Lo Mein $10.25" },
      { id: "M", name: "Spare Rib Tips", price: "Plain Small $6.50 / Plain Large $9.25 / French Fries $8.50 / Plain Fried Rice $8.50 / Pork Fried Rice $9.50 / Chicken Fried Rice $9.50 / Beef Fried Rice $10.50 / Shrimp Fried Rice $10.50 / Plain Lo Mein $10.50" },
      { id: "N", name: "Shrimp Stick (3)", price: "Plain $5.95 / French Fries $7.95 / Plain Fried Rice $7.95 / Pork Fried Rice $8.95 / Chicken Fried Rice $8.95 / Beef Fried Rice $9.95 / Shrimp Fried Rice $9.95 / Plain Lo Mein $9.95" },
      { id: "O", name: "Chicken Nugget (10)", price: "Plain $6.25 / French Fries $8.25 / Plain Fried Rice $8.25 / Pork Fried Rice $9.25 / Chicken Fried Rice $9.25 / Beef Fried Rice $9.99 / Shrimp Fried Rice $9.99 / Plain Lo Mein $9.99" },
      { id: "P", name: "Fried Chicken Gizzards", price: "Plain $6.25 / French Fries $8.25 / Plain Fried Rice $8.25 / Pork Fried Rice $9.25 / Chicken Fried Rice $9.25 / Beef Fried Rice $9.99 / Shrimp Fried Rice $9.99 / Plain Lo Mein $9.99" },
      { id: "Q", name: "Boneless Spare Ribs", price: "Plain Small $8.75 / Plain Large $13.95 / French Fries $10.75 / Plain Fried Rice $10.75 / Pork Fried Rice $11.75 / Chicken Fried Rice $11.75 / Beef Fried Rice $12.75 / Shrimp Fried Rice $12.75 / Plain Lo Mein $12.75" },
      { id: "R", name: "B-B-Q Spare Ribs", price: "Plain Small $8.75 / Plain Large $13.95 / French Fries $10.75 / Plain Fried Rice $10.75 / Pork Fried Rice $11.75 / Chicken Fried Rice $11.75 / Beef Fried Rice $12.75 / Shrimp Fried Rice $12.75 / Plain Lo Mein $12.75" },
    ],
  },
  {
    id: "beef",
    title: "Beef",
    note: "With white rice.",
    items: [
      { id: "78", name: "Pepper Steak with Onion", price: "Pt $8.50 / Qt $12.95" },
      { id: "79", name: "Beef with Broccoli", price: "Pt $8.50 / Qt $12.95" },
      { id: "80", name: "Beef with Mixed Vegetables", price: "Pt $8.50 / Qt $12.95" },
      { id: "81", name: "Szechuan Beef", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "82", name: "Beef with Mushroom", price: "Pt $8.50 / Qt $12.95" },
      { id: "83", name: "Beef with Black Bean Sauce", price: "Pt $8.50 / Qt $12.95" },
      { id: "84", name: "Beef with Garlic Sauce", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "85", name: "Hunan Beef", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "86", name: "Mongolian Beef", price: "$13.95", spicy: true },
    ],
  },
  {
    id: "chicken",
    title: "Chicken",
    note: "With white rice.",
    items: [
      { id: "66", name: "Chicken with Black Bean Sauce", price: "Pt $8.25 / Qt $12.75" },
      { id: "67", name: "Chicken with Mixed Vegetable", price: "Pt $8.25 / Qt $12.75" },
      { id: "68", name: "Chicken with Broccoli", price: "Pt $8.25 / Qt $12.75" },
      { id: "69", name: "Chicken with Garlic Sauce", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "70", name: "Szechuan Chicken", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "71", name: "Hunan Chicken", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "72", name: "Bourbon Chicken", price: "Pt $8.25 / Qt $12.75" },
      { id: "73", name: "Curry Chicken with Onion", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "74", name: "Moo Goo Gai Pan", price: "Pt $8.25 / Qt $12.75" },
      { id: "75", name: "Honey Chicken", price: "Pt $8.25 / Qt $12.75" },
      { id: "76", name: "Chicken with Cashew Nuts", price: "Pt $8.25 / Qt $12.75" },
      { id: "77", name: "Kung Pao Chicken", price: "Pt $8.25 / Qt $12.75", spicy: true },
    ],
  },
  {
    id: "pork",
    title: "Pork",
    note: "With white rice.",
    items: [
      { id: "87", name: "Roast Pork with Broccoli", price: "Pt $8.25 / Qt $12.75" },
      { id: "88", name: "Roast Pork with Mushroom", price: "Pt $8.25 / Qt $12.75" },
      { id: "89", name: "Szechuan Pork", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "90", name: "Roast Pork with Garlic Sauce", price: "Pt $8.25 / Qt $12.75", spicy: true },
      { id: "91", name: "Roast Pork with Mixed Vegetable", price: "Pt $8.25 / Qt $12.75" },
      { id: "92", name: "Roast Pork Hunan Style", price: "Pt $8.25 / Qt $12.75", spicy: true },
    ],
  },
  {
    id: "seafood",
    title: "Seafood",
    note: "With white rice.",
    items: [
      { id: "58", name: "Shrimp with Lobster Sauce (Soup)", price: "Pt $8.50 / Qt $12.95" },
      { id: "59", name: "Shrimp with Broccoli", price: "Pt $8.50 / Qt $12.95" },
      { id: "60", name: "Shrimp with Mixed Vegetable", price: "Pt $8.50 / Qt $12.95" },
      { id: "61", name: "Shrimp with Mushroom", price: "Pt $8.50 / Qt $12.95" },
      { id: "62", name: "Shrimp with Garlic Sauce", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "63", name: "Hunan Shrimp", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "64", name: "Szechuan Shrimp", price: "Pt $8.50 / Qt $12.95", spicy: true },
      { id: "65", name: "Hot & Spicy Shrimp", price: "$13.95", spicy: true },
    ],
  },
  {
    id: "vegetable",
    title: "Vegetable",
    note: "With white rice.",
    items: [
      { id: "53", name: "Plain Broccoli", price: "Pt $6.50 / Qt $9.25" },
      { id: "54", name: "Mixed Vegetables", price: "Pt $6.50 / Qt $9.25" },
      { id: "55", name: "Ma Po Tofu", price: "$10.95", spicy: true },
      { id: "56", name: "Home Style Bean Curd", price: "$10.95" },
      { id: "57", name: "General Tso's Tofu", price: "$10.95", spicy: true },
    ],
  },
  {
    id: "egg-foo-young",
    title: "Egg Foo Young",
    note: "With white rice.",
    items: [
      { id: "93", name: "Roast Pork Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "94", name: "Chicken Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "95", name: "Shrimp Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "96", name: "Beef Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "97", name: "Vegetable Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
      { id: "98", name: "House Special Egg Foo Young", price: "Pt $8.25 / Qt $10.25" },
    ],
  },
  {
    id: "diet-menu",
    title: "Diet Menu",
    note: "With sauce on the side. With white rice.",
    items: [
      { id: "99", name: "Steamed Broccoli", price: "Pt $6.50 / Qt $9.25" },
      { id: "100", name: "Steamed Shrimp w. Broccoli", price: "Pt $8.50 / Qt $12.95" },
      { id: "101", name: "Steamed Chicken w. Mixed Vegetable", price: "Pt $8.25 / Qt $12.75" },
    ],
  },
  {
    id: "sweet-sour",
    title: "Sweet & Sour",
    note: "With white rice.",
    items: [
      { id: "102", name: "Sweet & Sour Chicken", price: "Pt $8.25 / Qt $12.75" },
      { id: "103", name: "Sweet & Sour Shrimp", price: "Pt $8.25 / Qt $12.95" },
    ],
  },
  {
    id: "wing-special",
    title: "Wing Special",
    note: "Chicken wings special from green flyer.",
    items: [
      { id: "W2", name: "2 Chicken Wings", price: "$3.75" },
      { id: "W3", name: "3 Chicken Wings", price: "$5.25" },
      { id: "W4", name: "4 Chicken Wings", price: "$6.50" },
      { id: "W6", name: "6 Chicken Wings", price: "$9.95" },
      { id: "W8", name: "8 Chicken Wings", price: "$12.85" },
      { id: "W10", name: "10 Chicken Wings", price: "$16.25" },
      { id: "W12", name: "12 Chicken Wings", price: "$19.25" },
      { id: "W16", name: "16 Chicken Wings", price: "$25.75" },
      { id: "W20", name: "20 Chicken Wings", price: "$32.25" },
      { id: "W24", name: "24 Chicken Wings", price: "$38.75" },
      { id: "W28", name: "28 Chicken Wings", price: "$44.95" },
      { id: "W32", name: "32 Chicken Wings", price: "$50.95" },
      { id: "W40", name: "40 Chicken Wings", price: "$63.95" },
      { id: "W60", name: "60 Chicken Wings", price: "$92.95" },
      { id: "W80", name: "80 Chicken Wings", price: "$119.95" },
      { id: "W100", name: "100 Chicken Wings", price: "$139.95" },
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
  "Lunch Special",
  "Chef's Specialties",
  "Combination Platters",
  "Wing Special",
  "Party Trays",
  "Fried Rice",
];

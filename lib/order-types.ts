export type PaymentMethod = "Cash" | "Cash App";

export type PickupTimeChoice = "ASAP" | "Later";

export type OrderStatus = "New" | "Accepted" | "Ready" | "Completed" | "Cancelled";

export type CartItem = {
  cartId: string;
  menuItemId: string;
  name: string;
  price: string;
  unitPrice: number;
  quantity: number;
  notes: string;
  spicy?: boolean;
};

export type StoredOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  pickupChoice: PickupTimeChoice;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  specialInstructions: string;
  items: CartItem[];
  estimatedSubtotal: number;
  status: OrderStatus;
  createdAt: string;
  printed: boolean;
  updatedAt: string;
};

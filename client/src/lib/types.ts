import { type ProductWithAvailability } from "@shared/types";

export interface CartItem {
  product: ProductWithAvailability;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

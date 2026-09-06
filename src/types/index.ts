import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image?: string | null;
  quantity: number;
}

export interface ShopData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  logo?: string | null;
  banner?: string | null;
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
}

export interface ProductData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  mrp?: number | null;
  unit: string;
  stock: number;
  image?: string | null;
  isAvailable: boolean;
  sku?: string | null;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  total: number;
  notes?: string | null;
  deliveryAddress?: string | null;
  deliveryPhone?: string | null;
  createdAt: Date;
  items: OrderItemData[];
  customer: {
    name: string;
    phone: string;
    email?: string | null;
  };
}

export interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    name: string;
    unit: string;
  };
}

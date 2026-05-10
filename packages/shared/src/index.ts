export type ScheduleType = "daily" | "alternate-days";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type OrderStatus = "placed" | "packed" | "out-for-delivery" | "delivered";

export interface Product {
  id: string;
  name: string;
  category: "Cow Milk" | "Curd" | "Ghee" | "Organic Vegetables" | "Farm Fresh Products";
  price: number;
  unit: string;
  stock: number;
  isOrganic: boolean;
}

export interface MilkSubscription {
  id: string;
  customerId: string;
  productId: string;
  quantityLiters: number;
  schedule: ScheduleType;
  morningDelivery: boolean;
  status: SubscriptionStatus;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  paymentMethod: "UPI" | "CARD" | "COD";
}

export { ToastBanner, useToast, type ToastKind, type ToastMessage } from "./ui/toast";

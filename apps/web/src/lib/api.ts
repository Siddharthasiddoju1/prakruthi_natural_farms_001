const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export type PaymentMethod = "UPI" | "CARD" | "COD";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number | string;
  unit: string;
  stockQty: number;
  organicTag?: string | null;
}

export interface Address {
  id: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  itemType: "ONE_TIME" | "SUBSCRIPTION";
  product: Product;
}

export interface Subscription {
  id: string;
  productId: string;
  quantityLiters: number | string;
  scheduleType: "DAILY" | "ALTERNATE_DAYS";
  morningDelivery: boolean;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  product: Product;
}

export interface Order {
  id: string;
  subtotal: number | string;
  deliveryFee: number | string;
  total: number | string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  orderStatus: "PLACED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED";
  deliverySlot?: string | null;
  createdAt: string;
}

function withAuth(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

function toCurrency(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

export function formatRupees(value: number | string): string {
  return `Rs ${toCurrency(value).toFixed(2)}`;
}

export interface LoginResponse {
  accessToken: string;
  customer: {
    id: string;
    mobile: string;
    name: string;
    email?: string;
  };
}

export interface CustomerProfile {
  id: string;
  mobile: string;
  name: string;
  email?: string;
}

export async function requestOtp(mobile: string) {
  const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile })
  });

  if (!response.ok) throw new Error("Failed to request OTP");
  return response.json() as Promise<{ message: string; otp?: string }>;
}

export async function verifyOtp(mobile: string, otp: string, name?: string) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, otp, name })
  });

  if (!response.ok) throw new Error("OTP verification failed");
  return response.json() as Promise<LoginResponse>;
}

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error("Unable to fetch products");
  return response.json() as Promise<Product[]>;
}

export async function getProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: withAuth(token)
  });
  if (!response.ok) throw new Error("Unable to fetch profile");
  return response.json() as Promise<CustomerProfile>;
}

export async function updateProfile(token: string, payload: { name: string; email?: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Unable to update profile");
  return response.json() as Promise<CustomerProfile>;
}

export async function getSubscriptions(token: string) {
  const response = await fetch(`${API_BASE_URL}/subscriptions`, {
    headers: withAuth(token)
  });
  if (!response.ok) throw new Error("Unable to fetch subscriptions");
  return response.json() as Promise<Subscription[]>;
}

export async function createSubscription(
  token: string,
  payload: { productId: string; quantityLiters: number; scheduleType: "DAILY" | "ALTERNATE_DAYS"; morningDelivery: boolean }
) {
  const response = await fetch(`${API_BASE_URL}/subscriptions`, {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Unable to create subscription");
  return response.json() as Promise<Subscription>;
}

export async function updateSubscriptionStatus(token: string, id: string, action: "pause" | "resume") {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${id}/${action}`, {
    method: "POST",
    headers: withAuth(token)
  });
  if (!response.ok) throw new Error(`Unable to ${action} subscription`);
  return response.json() as Promise<Subscription>;
}

export async function getCart(token: string) {
  const response = await fetch(`${API_BASE_URL}/carts`, { headers: withAuth(token) });
  if (!response.ok) throw new Error("Unable to fetch cart");
  return response.json() as Promise<{ cart: { id: string }; items: CartItem[] }>;
}

export async function addToCart(
  token: string,
  payload: { productId: string; quantity: number; itemType: "ONE_TIME" | "SUBSCRIPTION" }
) {
  const response = await fetch(`${API_BASE_URL}/carts/items`, {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Unable to add to cart");
  return response.json() as Promise<CartItem>;
}

export async function updateCartItem(token: string, cartItemId: string, quantity: number) {
  const response = await fetch(`${API_BASE_URL}/carts/items/${cartItemId}`, {
    method: "PATCH",
    headers: withAuth(token),
    body: JSON.stringify({ quantity })
  });
  if (!response.ok) throw new Error("Unable to update cart item");
  return response.json() as Promise<CartItem>;
}

export async function removeCartItem(token: string, cartItemId: string) {
  const response = await fetch(`${API_BASE_URL}/carts/items/${cartItemId}`, {
    method: "DELETE",
    headers: withAuth(token)
  });
  if (!response.ok) throw new Error("Unable to remove cart item");
}

export async function getAddresses(token: string) {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    headers: withAuth(token)
  });
  if (!response.ok) throw new Error("Unable to fetch addresses");
  return response.json() as Promise<Address[]>;
}

export async function createAddress(
  token: string,
  payload: Omit<Address, "id"> & { id?: never }
) {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Unable to create address");
  return response.json() as Promise<Address>;
}

export async function updateAddress(
  token: string,
  addressId: string,
  payload: Partial<Omit<Address, "id">>
) {
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Unable to update address");
  return response.json() as Promise<Address>;
}

export async function checkoutOrder(
  token: string,
  payload: {
    addressId: string;
    paymentMethod: PaymentMethod;
    deliverySlot: string;
    items: Array<{ productId: string; quantity: number; itemType: "ONE_TIME" | "SUBSCRIPTION" }>;
  }
) {
  const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Checkout failed");
  return response.json();
}

export async function getOrders(token: string) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: withAuth(token)
  });
  if (!response.ok) throw new Error("Unable to fetch orders");
  return response.json() as Promise<Order[]>;
}

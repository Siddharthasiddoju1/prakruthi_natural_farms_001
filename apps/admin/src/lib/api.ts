const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || "prakruthi-admin-dev";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-key": ADMIN_API_KEY
  };
}

export interface AdminOverview {
  products: number;
  activeSubscriptions: number;
  ordersToday: number;
  customers: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number | string;
  stockQty: number;
  isActive: boolean;
}

export interface AdminOrder {
  id: string;
  orderStatus: "PLACED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED";
  total: number | string;
}

export type AdminOrderStatus = AdminOrder["orderStatus"];

export async function getAdminOverview() {
  const response = await fetch(`${API_BASE_URL}/admin/overview`, { headers: headers() });
  if (!response.ok) throw new Error("Failed to fetch overview");
  return response.json() as Promise<AdminOverview>;
}

export async function getAdminOrders() {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, { headers: headers() });
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json() as Promise<AdminOrder[]>;
}

export async function updateAdminOrderStatus(orderId: string, status: AdminOrderStatus) {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error("Failed to update order status");
  return response.json();
}

export async function getAdminProducts() {
  const response = await fetch(`${API_BASE_URL}/admin/products`, { headers: headers() });
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json() as Promise<AdminProduct[]>;
}

export async function updateAdminProduct(
  productId: string,
  payload: { price: number; stockQty: number; isActive: boolean }
) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to update product");
  return response.json() as Promise<AdminProduct>;
}

export async function createAdminProduct(payload: {
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  stockQty: number;
  organicTag?: string;
  isActive?: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to create product");
  return response.json() as Promise<AdminProduct>;
}

export async function deleteAdminProduct(productId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: "DELETE",
    headers: headers()
  });
  if (!response.ok) throw new Error("Failed to delete product");
  return response.json() as Promise<{ mode: "hard-delete" | "soft-delete"; productId?: string }>;
}

export async function exportDeliveryListCsv(date: string) {
  const response = await fetch(`${API_BASE_URL}/admin/delivery-list/export?date=${encodeURIComponent(date)}&format=csv`, {
    headers: headers()
  });
  if (!response.ok) throw new Error("Failed to export delivery list");
  return response.text();
}

export async function runAdminBootstrap(force = false) {
  const response = await fetch(`${API_BASE_URL}/admin/bootstrap`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ force })
  });
  if (!response.ok) throw new Error("Failed to run bootstrap");
  return response.json() as Promise<{ inserted: number; skipped: boolean; totalProducts: number }>;
}

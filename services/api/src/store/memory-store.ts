import { randomUUID } from "crypto";

export interface CustomerRecord {
  id: string;
  mobile: string;
  name: string;
  email?: string;
}

export interface AddressRecord {
  id: string;
  customerId: string;
  line1: string;
  line2?: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000;
const otpStore = new Map<string, OtpEntry>();
const customersByMobile = new Map<string, CustomerRecord>();
const addressesByCustomer = new Map<string, AddressRecord[]>();

export function createOtp(mobile: string) {
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  otpStore.set(mobile, { otp, expiresAt: Date.now() + OTP_TTL_MS });
  return { otp, expiresAt: Date.now() + OTP_TTL_MS };
}

export function verifyOtp(mobile: string, otp: string): boolean {
  const data = otpStore.get(mobile);
  if (!data) return false;
  if (Date.now() > data.expiresAt) {
    otpStore.delete(mobile);
    return false;
  }
  const valid = data.otp === otp;
  if (valid) otpStore.delete(mobile);
  return valid;
}

export function findOrCreateCustomer(mobile: string, name?: string): CustomerRecord {
  const existing = customersByMobile.get(mobile);
  if (existing) return existing;

  const created: CustomerRecord = {
    id: randomUUID(),
    mobile,
    name: name?.trim() || "Prakruthi Customer"
  };
  customersByMobile.set(mobile, created);
  return created;
}

export function updateCustomerProfile(customerId: string, name: string, email?: string) {
  for (const [mobile, customer] of customersByMobile.entries()) {
    if (customer.id === customerId) {
      const updated = { ...customer, name, email };
      customersByMobile.set(mobile, updated);
      return updated;
    }
  }
  return undefined;
}

export function getCustomerById(customerId: string) {
  for (const customer of customersByMobile.values()) {
    if (customer.id === customerId) return customer;
  }
  return undefined;
}

export function listAddresses(customerId: string) {
  return addressesByCustomer.get(customerId) || [];
}

export function createAddress(customerId: string, payload: Omit<AddressRecord, "id" | "customerId">) {
  const current = addressesByCustomer.get(customerId) || [];
  const created: AddressRecord = {
    id: randomUUID(),
    customerId,
    ...payload
  };
  const normalized = payload.isDefault
    ? current.map((item) => ({ ...item, isDefault: false }))
    : current;
  addressesByCustomer.set(customerId, [...normalized, created]);
  return created;
}

export function updateAddress(customerId: string, addressId: string, payload: Partial<Omit<AddressRecord, "id" | "customerId">>) {
  const current = addressesByCustomer.get(customerId) || [];
  let updatedAddress: AddressRecord | undefined;

  const next = current.map((item) => {
    if (item.id !== addressId) {
      if (payload.isDefault) return { ...item, isDefault: false };
      return item;
    }
    updatedAddress = { ...item, ...payload };
    return updatedAddress;
  });

  if (!updatedAddress) return undefined;
  addressesByCustomer.set(customerId, next);
  return updatedAddress;
}

import { useEffect, useMemo, useState } from "react";
import { ToastBanner, useToast } from "../../../../packages/shared/src/ui/toast";
import { useAuth } from "../context/AuthContext";
import {
  checkoutOrder,
  createAddress,
  formatRupees,
  getAddresses,
  getCart,
  removeCartItem,
  updateCartItem,
  type Address,
  type CartItem,
  type PaymentMethod
} from "../lib/api";

export function CartPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    line1: "",
    line2: "",
    landmark: "",
    area: "",
    city: "",
    pincode: "",
    isDefault: false
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [deliverySlot, setDeliverySlot] = useState("Morning 6:00 AM - 8:00 AM");
  const [loading, setLoading] = useState(true);
  const { toast, showToast, dismissToast } = useToast();

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const delivery = subtotal >= 399 ? 0 : 20;
    return { subtotal, delivery, total: subtotal + delivery };
  }, [items]);

  const remainingForFreeDelivery = Math.max(0, 399 - totals.subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((totals.subtotal / 399) * 100));

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [cartData, addressData] = await Promise.all([getCart(token), getAddresses(token)]);
      setItems(cartData.items);
      setAddresses(addressData);
      const defaultAddress = addressData.find((item) => item.isDefault) || addressData[0];
      setSelectedAddressId(defaultAddress?.id || "");
    } catch {
      showToast("error", "Unable to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  async function onQuickAddressCreate() {
    if (!token) return;
    if (!addressForm.line1.trim() || !addressForm.area.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      showToast("error", "Fill line 1, area, city and pincode");
      return;
    }

    try {
      const created = await createAddress(token, {
        line1: addressForm.line1.trim(),
        line2: addressForm.line2.trim() || undefined,
        landmark: addressForm.landmark.trim() || undefined,
        area: addressForm.area.trim(),
        city: addressForm.city.trim(),
        pincode: addressForm.pincode.trim(),
        isDefault: addressForm.isDefault || addresses.length === 0
      });
      const updated = [...addresses, created];
      setAddresses(updated);
      setSelectedAddressId(created.id);
      setAddressForm({
        line1: "",
        line2: "",
        landmark: "",
        area: "",
        city: "",
        pincode: "",
        isDefault: false
      });
      setShowAddressForm(false);
      showToast("success", "Address added");
    } catch {
      showToast("error", "Unable to add address");
    }
  }

  async function onChangeQty(cartItemId: string, quantity: number) {
    if (!token) return;
    try {
      await updateCartItem(token, cartItemId, quantity);
      await loadData();
    } catch {
      showToast("error", "Unable to update quantity");
    }
  }

  async function onRemove(cartItemId: string) {
    if (!token) return;
    try {
      await removeCartItem(token, cartItemId);
      await loadData();
    } catch {
      showToast("error", "Unable to remove item");
    }
  }

  async function onCheckout() {
    if (!token || !selectedAddressId || items.length === 0) {
      showToast("error", "Address and cart items are required");
      return;
    }

    try {
      await checkoutOrder(token, {
        addressId: selectedAddressId,
        paymentMethod,
        deliverySlot,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          itemType: item.itemType
        }))
      });
      showToast("success", "Order placed successfully");
      await loadData();
    } catch {
      showToast("error", "Checkout failed");
    }
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Cart & Checkout</h2>
        <small>{items.length} items</small>
      </div>

      <ToastBanner toast={toast} onDismiss={dismissToast} />

      {loading ? <p>Loading cart...</p> : null}

      <article className="card">
        <h4>Free Delivery Tracker</h4>
        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${freeDeliveryProgress}%` }} />
        </div>
        <p>
          {remainingForFreeDelivery > 0
            ? `${formatRupees(remainingForFreeDelivery)} away from free delivery`
            : "Free delivery unlocked"}
        </p>
      </article>

      {items.map((item) => (
        <article className="card" key={item.id}>
          <h4>{item.product.name}</h4>
          <p>
            {item.itemType === "SUBSCRIPTION" ? "Subscription" : "One-time"} • {item.quantity} x {formatRupees(item.product.price)}
          </p>
          <div className="inline-actions">
            <button onClick={() => onChangeQty(item.id, Math.max(item.quantity - 1, 1))}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => onChangeQty(item.id, item.quantity + 1)}>+</button>
            <button onClick={() => onRemove(item.id)}>Remove</button>
          </div>
        </article>
      ))}

      <article className="card">
        <h4>Delivery Address</h4>
        {addresses.length === 0 ? <p>No address found. Add one quickly.</p> : null}
        {addresses.length > 0 ? (
          <select value={selectedAddressId} onChange={(event) => setSelectedAddressId(event.target.value)}>
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.line1}, {address.area}, {address.city} ({address.pincode})
              </option>
            ))}
          </select>
        ) : null}
        <div className="inline-actions">
          <button onClick={() => setShowAddressForm((current) => !current)}>
            {showAddressForm ? "Hide Address Form" : "Add New Address"}
          </button>
        </div>
        {showAddressForm ? (
          <div className="form-stack address-form-block">
            <input
              value={addressForm.line1}
              onChange={(event) => setAddressForm((current) => ({ ...current, line1: event.target.value }))}
              placeholder="House / street"
            />
            <input
              value={addressForm.line2}
              onChange={(event) => setAddressForm((current) => ({ ...current, line2: event.target.value }))}
              placeholder="Apartment / locality"
            />
            <input
              value={addressForm.landmark}
              onChange={(event) => setAddressForm((current) => ({ ...current, landmark: event.target.value }))}
              placeholder="Landmark"
            />
            <div className="grid two">
              <input
                value={addressForm.area}
                onChange={(event) => setAddressForm((current) => ({ ...current, area: event.target.value }))}
                placeholder="Area"
              />
              <input
                value={addressForm.city}
                onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                placeholder="City"
              />
            </div>
            <div className="grid two">
              <input
                value={addressForm.pincode}
                onChange={(event) => setAddressForm((current) => ({ ...current, pincode: event.target.value }))}
                placeholder="Pincode"
              />
              <label className="toggle-line">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))}
                />
                Make default
              </label>
            </div>
            <button onClick={onQuickAddressCreate}>Save Address</button>
          </div>
        ) : null}
      </article>

      <article className="card">
        <h4>Delivery Slot</h4>
        <select value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value)}>
          <option value="Morning 6:00 AM - 8:00 AM">Morning 6:00 AM - 8:00 AM</option>
          <option value="Morning 8:00 AM - 10:00 AM">Morning 8:00 AM - 10:00 AM</option>
          <option value="Evening 5:00 PM - 7:00 PM">Evening 5:00 PM - 7:00 PM</option>
        </select>
      </article>

      <article className="card">
        <h4>Payment Method</h4>
        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
          <option value="UPI">UPI</option>
          <option value="CARD">Debit / Credit Card</option>
          <option value="COD">Cash on Delivery</option>
        </select>
      </article>

      <article className="card summary">
        <p>Subtotal: {formatRupees(totals.subtotal)}</p>
        <p>Delivery: {formatRupees(totals.delivery)}</p>
        <h4>Total: {formatRupees(totals.total)}</h4>
        <button onClick={onCheckout}>Proceed to Payment</button>
      </article>
    </section>
  );
}

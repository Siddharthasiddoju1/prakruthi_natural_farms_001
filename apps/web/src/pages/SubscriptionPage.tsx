import { useEffect, useMemo, useState } from "react";
import { ToastBanner, useToast } from "../../../../packages/shared/src/ui/toast";
import { useAuth } from "../context/AuthContext";
import {
  createSubscription,
  formatRupees,
  getProducts,
  getSubscriptions,
  updateSubscriptionStatus,
  type Product,
  type Subscription
} from "../lib/api";

export function SubscriptionPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantityLiters, setQuantityLiters] = useState(1);
  const [scheduleType, setScheduleType] = useState<"DAILY" | "ALTERNATE_DAYS">("DAILY");
  const { toast, showToast, dismissToast } = useToast();

  const monthlySummary = useMemo(() => {
    return subscriptions.reduce(
      (acc, item) => {
        const quantity = Number(item.quantityLiters);
        const days = item.scheduleType === "DAILY" ? 30 : 15;
        const liters = quantity * days;
        const amount = Number(item.product.price) * liters;
        return { liters: acc.liters + liters, amount: acc.amount + amount };
      },
      { liters: 0, amount: 0 }
    );
  }, [subscriptions]);

  async function loadData() {
    if (!token) return;
    try {
      const [p, s] = await Promise.all([getProducts(), getSubscriptions(token)]);
      const milkProducts = p.filter((item) => item.category.toLowerCase().includes("milk") || item.name.toLowerCase().includes("milk"));
      setProducts(milkProducts.length > 0 ? milkProducts : p);
      setSelectedProductId((current) => current || (milkProducts[0]?.id || p[0]?.id || ""));
      setSubscriptions(s);
    } catch {
      showToast("error", "Unable to load subscription data");
    }
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  async function onCreateSubscription() {
    if (!token || !selectedProductId) return;
    try {
      await createSubscription(token, {
        productId: selectedProductId,
        quantityLiters,
        scheduleType,
        morningDelivery: true
      });
      showToast("success", "Subscription created");
      await loadData();
    } catch {
      showToast("error", "Unable to create subscription");
    }
  }

  async function onChangeStatus(id: string, action: "pause" | "resume") {
    if (!token) return;
    try {
      await updateSubscriptionStatus(token, id, action);
      showToast("success", `Subscription ${action}d`);
      await loadData();
    } catch {
      showToast("error", `Unable to ${action} subscription`);
    }
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Milk Subscription</h2>
        <small>{subscriptions.length} plans</small>
      </div>

      <ToastBanner toast={toast} onDismiss={dismissToast} />

      <div className="grid two">
        <article className="card mini-stat">
          <small>Monthly Volume</small>
          <h3>{monthlySummary.liters.toFixed(0)} L</h3>
        </article>
        <article className="card mini-stat">
          <small>Projected Bill</small>
          <h3>{formatRupees(monthlySummary.amount)}</h3>
        </article>
      </div>

      <article className="card form-stack">
        <h4>Create / Update Plan</h4>
        <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={quantityLiters}
          onChange={(event) => setQuantityLiters(Math.max(1, Number(event.target.value) || 1))}
        />
        <select value={scheduleType} onChange={(event) => setScheduleType(event.target.value as "DAILY" | "ALTERNATE_DAYS")}>
          <option value="DAILY">Daily</option>
          <option value="ALTERNATE_DAYS">Alternate Days</option>
        </select>
        <button onClick={onCreateSubscription}>Save Subscription</button>
      </article>

      {subscriptions.map((item) => (
        <article className="card" key={item.id}>
          <p>
            Current Plan: {item.quantityLiters} liter {item.product.name}
          </p>
          <p>Schedule: {item.scheduleType === "ALTERNATE_DAYS" ? "Alternate Days" : "Daily"}</p>
          <p>
            Status: <span className={`chip ${item.status === "ACTIVE" ? "chip-live" : "chip-muted"}`}>{item.status}</span>
          </p>
          <div className="grid two">
            <button onClick={() => onChangeStatus(item.id, "pause")}>Pause</button>
            <button onClick={() => onChangeStatus(item.id, "resume")}>Resume</button>
          </div>
        </article>
      ))}

      <article className="card">
        <h4>Monthly Billing Summary</h4>
        <p>Delivered: {monthlySummary.liters.toFixed(0)} liters</p>
        <p>Amount: {formatRupees(monthlySummary.amount)}</p>
      </article>
    </section>
  );
}

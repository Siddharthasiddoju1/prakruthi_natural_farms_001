import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatRupees, getOrders, type Order } from "../lib/api";

function formatStatus(status: Order["orderStatus"]) {
  return status.replaceAll("_", " ");
}

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getOrders(token)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="page">
      <div className="section-head">
        <h2>Order Tracking</h2>
        <small>{orders.length} orders</small>
      </div>
      {loading ? <p>Loading orders...</p> : null}
      {!loading && orders.length === 0 ? <p>No orders yet.</p> : null}
      {orders.map((order) => (
        <article key={order.id} className="card">
          <div className="order-row">
            <h4>{order.id}</h4>
            <span className={`chip ${order.orderStatus === "DELIVERED" ? "chip-live" : "chip-muted"}`}>
              {formatStatus(order.orderStatus)}
            </span>
          </div>
          <small>{new Date(order.createdAt).toLocaleString()}</small>
          <p>Total: {formatRupees(order.total)}</p>
          <div className="tracker">Placed → Packed → Out for Delivery → Delivered</div>
        </article>
      ))}
    </section>
  );
}

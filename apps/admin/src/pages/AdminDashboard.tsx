import { useEffect, useState } from "react";
import { ToastBanner, useToast } from "../../../../packages/shared/src/ui/toast";
import {
  createAdminProduct,
  deleteAdminProduct,
  exportDeliveryListCsv,
  getAdminOrders,
  getAdminOverview,
  getAdminProducts,
  runAdminBootstrap,
  updateAdminOrderStatus,
  updateAdminProduct,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminOverview,
  type AdminProduct
} from "../lib/api";

type NewProductErrors = Partial<Record<"name" | "category" | "unit" | "price" | "stockQty", string>>;

export function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [statusDraft, setStatusDraft] = useState<Record<string, AdminOrderStatus>>({});
  const [priceDraft, setPriceDraft] = useState<Record<string, number>>({});
  const [stockDraft, setStockDraft] = useState<Record<string, number>>({});
  const [activeDraft, setActiveDraft] = useState<Record<string, boolean>>({});
  const [exportDate, setExportDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Farm Fresh Products",
    description: "",
    price: 0,
    unit: "unit",
    stockQty: 0,
    organicTag: "Natural"
  });
  const [newProductErrors, setNewProductErrors] = useState<NewProductErrors>({});
  const [productUpdateErrors, setProductUpdateErrors] = useState<Record<string, string>>({});
  const { toast, showToast, dismissToast, setToast } = useToast();

  function validateNewProductForm(): NewProductErrors {
    const nextErrors: NewProductErrors = {};

    if (!newProduct.name.trim()) nextErrors.name = "Product name is required";
    if (!newProduct.category.trim()) nextErrors.category = "Category is required";
    if (!newProduct.unit.trim()) nextErrors.unit = "Unit is required";
    if (!Number.isFinite(Number(newProduct.price)) || Number(newProduct.price) < 0) {
      nextErrors.price = "Price must be 0 or more";
    }
    if (!Number.isFinite(Number(newProduct.stockQty)) || Number(newProduct.stockQty) < 0) {
      nextErrors.stockQty = "Stock must be 0 or more";
    }

    return nextErrors;
  }

  function validateProductDraft(productId: string): string | null {
    const price = Number(priceDraft[productId] ?? 0);
    const stockQty = Number(stockDraft[productId] ?? 0);

    if (!Number.isFinite(price) || price < 0) {
      return "Price must be 0 or more";
    }
    if (!Number.isFinite(stockQty) || stockQty < 0) {
      return "Stock must be 0 or more";
    }
    return null;
  }

  async function loadData() {
    try {
      const [metrics, orderList, productList] = await Promise.all([
        getAdminOverview(),
        getAdminOrders(),
        getAdminProducts()
      ]);

      setOverview(metrics);
      setOrders(orderList.slice(0, 12));
      setProducts(productList);

      const nextStatus: Record<string, AdminOrderStatus> = {};
      for (const order of orderList) {
        nextStatus[order.id] = order.orderStatus;
      }
      setStatusDraft(nextStatus);

      const nextPrice: Record<string, number> = {};
      const nextStock: Record<string, number> = {};
      const nextActive: Record<string, boolean> = {};

      for (const product of productList) {
        nextPrice[product.id] = Number(product.price);
        nextStock[product.id] = product.stockQty;
        nextActive[product.id] = product.isActive;
      }

      setPriceDraft(nextPrice);
      setStockDraft(nextStock);
      setActiveDraft(nextActive);
      setToast(null);
    } catch {
      showToast("error", "Unable to load admin dashboard data");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function onBootstrap(force: boolean) {
    if (force) {
      const confirmed = window.confirm(
        "Force re-seed will remove existing products and replace with defaults. Continue?"
      );
      if (!confirmed) return;
    }

    try {
      const result = await runAdminBootstrap(force);
      showToast(
        "success",
        result.skipped
          ? `Bootstrap skipped, products already exist (${result.totalProducts})`
          : `Bootstrap inserted ${result.inserted} products`
      );
      await loadData();
    } catch {
      showToast("error", "Unable to run bootstrap");
    }
  }

  async function onOrderStatusSave(orderId: string) {
    const nextStatus = statusDraft[orderId];
    if (!nextStatus) return;

    try {
      await updateAdminOrderStatus(orderId, nextStatus);
      showToast("success", `Order ${orderId} status updated`);
      await loadData();
    } catch {
      showToast("error", "Unable to update order status");
    }
  }

  async function onProductSave(productId: string) {
    const validationError = validateProductDraft(productId);
    if (validationError) {
      setProductUpdateErrors((current) => ({ ...current, [productId]: validationError }));
      return;
    }

    setProductUpdateErrors((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });

    try {
      await updateAdminProduct(productId, {
        price: Number(priceDraft[productId] ?? 0),
        stockQty: Number(stockDraft[productId] ?? 0),
        isActive: Boolean(activeDraft[productId])
      });
      showToast("success", "Product updated");
      await loadData();
    } catch {
      showToast("error", "Unable to update product");
    }
  }

  async function onProductCreate() {
    const errors = validateNewProductForm();
    setNewProductErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await createAdminProduct({
        ...newProduct,
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        unit: newProduct.unit.trim(),
        price: Number(newProduct.price),
        stockQty: Number(newProduct.stockQty),
        isActive: true
      });
      showToast("success", "Product created");
      setNewProduct({
        name: "",
        category: "Farm Fresh Products",
        description: "",
        price: 0,
        unit: "unit",
        stockQty: 0,
        organicTag: "Natural"
      });
      setNewProductErrors({});
      await loadData();
    } catch {
      showToast("error", "Unable to create product");
    }
  }

  async function onProductDelete(productId: string, productName: string) {
    const confirmed = window.confirm(`Delete product '${productName}'? This may archive instead of hard delete if referenced.`);
    if (!confirmed) return;

    try {
      const result = await deleteAdminProduct(productId);
      showToast("success", result.mode === "hard-delete" ? "Product deleted" : "Product archived (soft-deleted)");
      await loadData();
    } catch {
      showToast("error", "Unable to delete product");
    }
  }

  async function onExportDeliveryList() {
    try {
      const csv = await exportDeliveryListCsv(exportDate);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `daily-delivery-list-${exportDate}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showToast("success", "Delivery list export downloaded");
    } catch {
      showToast("error", "Unable to export delivery list");
    }
  }

  return (
    <div className="layout">
      <header>
        <h1>Prakruthi Admin Panel</h1>
        <p>Manage products, orders, subscriptions, and delivery operations.</p>
      </header>

      <ToastBanner toast={toast} onDismiss={dismissToast} />

      <section className="card action-row">
        <button onClick={() => void onBootstrap(false)}>Run Bootstrap</button>
        <button onClick={() => void onBootstrap(true)}>Force Re-seed Products</button>
      </section>

      <section className="card export-row">
        <h3>Delivery List Export</h3>
        <input type="date" value={exportDate} onChange={(event) => setExportDate(event.target.value)} />
        <button onClick={() => void onExportDeliveryList()}>Download CSV</button>
      </section>

      <section className="grid">
        <article className="card">
          <h3>Products</h3>
          <p>{overview?.products ?? "-"}</p>
        </article>
        <article className="card">
          <h3>Active Subscriptions</h3>
          <p>{overview?.activeSubscriptions ?? "-"}</p>
        </article>
        <article className="card">
          <h3>Orders Today</h3>
          <p>{overview?.ordersToday ?? "-"}</p>
        </article>
        <article className="card">
          <h3>Customers</h3>
          <p>{overview?.customers ?? "-"}</p>
        </article>
      </section>

      <section className="card">
        <h3>Recent Orders</h3>
        {orders.map((order) => (
          <div key={order.id} className="row">
            <span>{order.id}</span>
            <select
              value={statusDraft[order.id] || order.orderStatus}
              onChange={(event) =>
                setStatusDraft((current) => ({
                  ...current,
                  [order.id]: event.target.value as AdminOrderStatus
                }))
              }
            >
              <option value="PLACED">PLACED</option>
              <option value="PACKED">PACKED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
            <span>Rs {Number(order.total).toFixed(2)}</span>
            <button onClick={() => void onOrderStatusSave(order.id)}>Save</button>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Create Product</h3>
        <div className="create-grid">
          <input
            className={newProductErrors.name ? "invalid" : undefined}
            placeholder="Name"
            value={newProduct.name}
            onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className={newProductErrors.category ? "invalid" : undefined}
            placeholder="Category"
            value={newProduct.category}
            onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value }))}
          />
          <input
            className={newProductErrors.unit ? "invalid" : undefined}
            placeholder="Unit"
            value={newProduct.unit}
            onChange={(event) => setNewProduct((current) => ({ ...current, unit: event.target.value }))}
          />
          <input
            className={newProductErrors.price ? "invalid" : undefined}
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(event) => setNewProduct((current) => ({ ...current, price: Number(event.target.value) }))}
          />
          <input
            className={newProductErrors.stockQty ? "invalid" : undefined}
            type="number"
            placeholder="Stock"
            value={newProduct.stockQty}
            onChange={(event) => setNewProduct((current) => ({ ...current, stockQty: Number(event.target.value) }))}
          />
          <input
            placeholder="Tag"
            value={newProduct.organicTag}
            onChange={(event) => setNewProduct((current) => ({ ...current, organicTag: event.target.value }))}
          />
          <input
            className="create-description"
            placeholder="Description"
            value={newProduct.description}
            onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))}
          />
          <button onClick={() => void onProductCreate()}>Create Product</button>
          {Object.values(newProductErrors).length > 0 ? (
            <p className="inline-error create-description">{Object.values(newProductErrors)[0]}</p>
          ) : null}
        </div>
      </section>

      <section className="card">
        <h3>Manage Products</h3>
        {products.map((product) => (
          <div key={product.id} className="product-row">
            <strong>{product.name}</strong>
            <input
              className={productUpdateErrors[product.id] ? "invalid" : undefined}
              type="number"
              value={priceDraft[product.id] ?? Number(product.price)}
              onChange={(event) =>
                setPriceDraft((current) => ({
                  ...current,
                  [product.id]: Number(event.target.value)
                }))
              }
            />
            <input
              className={productUpdateErrors[product.id] ? "invalid" : undefined}
              type="number"
              value={stockDraft[product.id] ?? product.stockQty}
              onChange={(event) =>
                setStockDraft((current) => ({
                  ...current,
                  [product.id]: Number(event.target.value)
                }))
              }
            />
            <label className="toggle">
              <input
                type="checkbox"
                checked={activeDraft[product.id] ?? product.isActive}
                onChange={(event) =>
                  setActiveDraft((current) => ({
                    ...current,
                    [product.id]: event.target.checked
                  }))
                }
              />
              Active
            </label>
            <button onClick={() => void onProductSave(product.id)}>Update</button>
            <button onClick={() => void onProductDelete(product.id, product.name)}>Delete</button>
            {productUpdateErrors[product.id] ? (
              <p className="inline-error product-error">{productUpdateErrors[product.id]}</p>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}

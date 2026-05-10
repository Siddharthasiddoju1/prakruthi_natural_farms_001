import { useEffect, useMemo, useState } from "react";
import { ToastBanner, useToast } from "../../../../packages/shared/src/ui/toast";
import { useAuth } from "../context/AuthContext";
import { addToCart, formatRupees, getProducts, type Product } from "../lib/api";

export function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc">("popular");
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { toast, showToast, dismissToast } = useToast();

  function getQty(productId: string) {
    return quantities[productId] ?? 0;
  }

  function setQty(productId: string, qty: number) {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, qty) }));
  }

  useEffect(() => {
    let mounted = true;
    getProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch(() => {
        if (mounted) showToast("error", "Unable to load products");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.map((item) => item.category));
    return ["all", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let next = products.filter((item) => {
      const inCategory = categoryFilter === "all" || item.category === categoryFilter;
      const inSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch);
      return inCategory && inSearch;
    });

    if (sortBy === "price-asc") {
      next = [...next].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      next = [...next].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return next;
  }, [products, categoryFilter, searchTerm, sortBy]);

  async function onAddToCart(productId: string) {
    if (!token) return;
    const qty = getQty(productId);
    if (qty < 1) return;
    try {
      await addToCart(token, { productId, quantity: qty, itemType: "ONE_TIME" });
      showToast("success", `Added ${qty} to cart`);
      setQty(productId, 0);
    } catch {
      showToast("error", "Failed to add item");
    }
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Products</h2>
        <small>{filteredProducts.length} items</small>
      </div>

      <ToastBanner toast={toast} onDismiss={dismissToast} />

      <article className="card filter-panel">
        <input
          placeholder="Search products, categories..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="grid two">
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "popular" | "price-asc" | "price-desc")}>
            <option value="popular">Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </article>

      {loading ? <p>Loading products...</p> : null}

      <div className="grid one">
        {filteredProducts.map((item) => {
          const qty = getQty(item.id);
          return (
            <article key={item.id} className="card product">
              <div>
                <h4>{item.name}</h4>
                <p>
                  {formatRupees(item.price)} / {item.unit}
                </p>
                <small>{item.stockQty > 0 ? "In Stock" : "Out of Stock"}</small>
              </div>
              <div>
                <span className="tag">{item.organicTag || item.category}</span>
                {qty === 0 ? (
                  <button onClick={() => setQty(item.id, 1)} disabled={item.stockQty <= 0}>
                    Select
                  </button>
                ) : (
                  <div className="qty-picker">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => setQty(item.id, qty - 1)}>−</button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => setQty(item.id, qty + 1)}>+</button>
                    </div>
                    <button className="add-cart-btn" onClick={() => onAddToCart(item.id)}>
                      Add {qty} to Cart
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!loading && filteredProducts.length === 0 ? (
        <article className="card">
          <h4>No products found</h4>
          <p>Try changing your filter or search term.</p>
        </article>
      ) : null}
    </section>
  );
}

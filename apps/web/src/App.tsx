import { NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { CartPage } from "./pages/CartPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { OrdersPage } from "./pages/OrdersPage";
import { LoginPage } from "./pages/LoginPage";
import { AccountPage } from "./pages/AccountPage";
import { useAuth } from "./context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/subscription", label: "Milk Plan" },
  { to: "/cart", label: "Cart" },
  { to: "/orders", label: "Orders" },
  { to: "/account", label: "Account" }
];

export default function App() {
  const { customer, token, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-content">
          <h1>Prakruthi Natural Farms</h1>
          <p>Farm fresh essentials delivered daily</p>
          {token ? <span className="chip chip-live">Live Delivery Service</span> : null}
          {customer ? (
            <div className="profile-strip">
              <span>{customer.name}</span>
              <button type="button" onClick={logout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="content">
        {!token ? (
          <LoginPage />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        )}
      </main>

      {token ? (
        <nav className="bottom-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

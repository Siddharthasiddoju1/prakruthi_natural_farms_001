import { Link } from "react-router-dom";

const categories = [
  { name: "Cow Milk", subtitle: "Daily 6 AM" },
  { name: "Curd", subtitle: "Freshly set" },
  { name: "Ghee", subtitle: "Traditional bilona" },
  { name: "Organic Vegetables", subtitle: "Seasonal basket" },
  { name: "Farm Fresh Products", subtitle: "Chemical-free" }
];

export function HomePage() {
  return (
    <section className="page">
      <div className="hero card">
        <small className="eyebrow">Prakruthi Premium Delivery</small>
        <h2>Nature at your doorstep, every sunrise</h2>
        <p>Fresh milk, organic vegetables, and farm essentials delivered with reliable morning routes.</p>
        <div className="hero-actions">
          <Link className="button-link" to="/subscription">
            Start Milk Plan
          </Link>
          <Link className="button-ghost" to="/products">
            Explore Products
          </Link>
        </div>
      </div>

      <div className="grid two">
        <article className="card mini-stat">
          <small>Today Delivery Window</small>
          <h3>6:00 AM - 8:00 AM</h3>
        </article>
        <article className="card mini-stat">
          <small>Free Delivery Threshold</small>
          <h3>Rs 399</h3>
        </article>
      </div>

      <div className="section-head">
        <h3>Daily Essentials</h3>
        <Link to="/products">View all</Link>
      </div>

      <div className="grid two">
        {categories.map((category) => (
          <article key={category.name} className="card mini">
            <strong>{category.name}</strong>
            <p>{category.subtitle}</p>
          </article>
        ))}
      </div>

      <article className="card highlight-strip">
        <h4>Why customers stay with Prakruthi</h4>
        <div className="grid two">
          <p>Morning-first routes</p>
          <p>Direct from natural farms</p>
          <p>Flexible pause/resume plan</p>
          <p>Transparent monthly billing</p>
        </div>
      </article>
    </section>
  );
}

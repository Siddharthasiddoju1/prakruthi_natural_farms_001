import React from "react";
import ReactDOM from "react-dom/client";
import { AdminDashboard } from "./pages/AdminDashboard";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminDashboard />
  </React.StrictMode>
);

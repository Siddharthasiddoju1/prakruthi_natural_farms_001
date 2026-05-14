import cors from "cors";
import express from "express";
import { addressesRouter } from "./routes/addresses";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { cartsRouter } from "./routes/carts";
import { productsRouter } from "./routes/products";
import { subscriptionsRouter } from "./routes/subscriptions";
import { ordersRouter } from "./routes/orders";

const app = express();

// ✅ Environment-aware CORS configuration
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:4000").split(",").map(origin => origin.trim());

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "prakruthi-api",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/orders", ordersRouter);

const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔐 CORS Origins: ${corsOrigins.join(", ")}`);
});

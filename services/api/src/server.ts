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
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "prakruthi-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/orders", ordersRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

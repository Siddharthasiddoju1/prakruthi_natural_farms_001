import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const subscriptionsRouter = Router();

subscriptionsRouter.use(requireAuth);

subscriptionsRouter.get("/", async (req, res) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { customerId: req.user!.id },
    include: { product: true },
    orderBy: { startDate: "desc" }
  });
  res.json(subscriptions);
});

subscriptionsRouter.post("/", async (req, res) => {
  const { productId, quantityLiters, scheduleType, morningDelivery } = req.body as {
    productId?: string;
    quantityLiters?: number;
    scheduleType?: "DAILY" | "ALTERNATE_DAYS";
    morningDelivery?: boolean;
  };

  if (!productId || !quantityLiters || quantityLiters <= 0) {
    return res.status(400).json({ message: "productId and quantityLiters are required" });
  }

  const subscription = await prisma.subscription.create({
    data: {
      customerId: req.user!.id,
      productId,
      quantityLiters,
      scheduleType: scheduleType === "ALTERNATE_DAYS" ? "ALTERNATE_DAYS" : "DAILY",
      morningDelivery: morningDelivery ?? true,
      status: "ACTIVE"
    }
  });

  return res.status(201).json(subscription);
});

subscriptionsRouter.post("/:id/pause", async (req, res) => {
  const existing = await prisma.subscription.findFirst({
    where: { id: req.params.id, customerId: req.user!.id }
  });
  if (!existing) return res.status(404).json({ message: "Subscription not found" });

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: "PAUSED" }
  });
  res.json(updated);
});

subscriptionsRouter.post("/:id/resume", async (req, res) => {
  const existing = await prisma.subscription.findFirst({
    where: { id: req.params.id, customerId: req.user!.id }
  });
  if (!existing) return res.status(404).json({ message: "Subscription not found" });

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: "ACTIVE" }
  });
  res.json(updated);
});

import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get("/", async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user!.id },
    include: {
      items: { include: { product: true } },
      address: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(orders);
});

ordersRouter.post("/checkout", async (req, res) => {
  const { addressId, paymentMethod, deliverySlot, items } = req.body as {
    addressId?: string;
    paymentMethod?: "UPI" | "CARD" | "COD";
    deliverySlot?: string;
    items?: Array<{ productId: string; quantity: number; itemType?: "ONE_TIME" | "SUBSCRIPTION" }>;
  };

  if (!addressId || !paymentMethod) {
    return res.status(400).json({ message: "addressId and paymentMethod are required" });
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, customerId: req.user!.id }
  });
  if (!address) return res.status(404).json({ message: "Address not found" });

  const checkoutItems = items && items.length > 0 ? items : [];
  if (checkoutItems.length === 0) {
    return res.status(400).json({ message: "At least one checkout item is required" });
  }

  const productIds = [...new Set(checkoutItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  if (products.length !== productIds.length) {
    return res.status(400).json({ message: "One or more products are invalid" });
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const lineItems = checkoutItems.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * item.quantity;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      itemType: item.itemType || "ONE_TIME"
    };
  });

  const subtotal = lineItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const deliveryFee = subtotal >= 399 ? 0 : 20;
  const total = subtotal + deliveryFee;

  const payment =
    paymentMethod === "CARD"
      ? "CARD"
      : paymentMethod === "COD"
        ? "COD"
        : "UPI";

  const created = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerId: req.user!.id,
        addressId,
        subtotal: new Prisma.Decimal(subtotal),
        deliveryFee: new Prisma.Decimal(deliveryFee),
        total: new Prisma.Decimal(total),
        paymentMethod: payment,
        paymentStatus: payment === "COD" ? "pending" : "paid",
        orderStatus: "PLACED",
        deliverySlot
      }
    });

    await tx.orderItem.createMany({
      data: lineItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        itemType: item.itemType
      }))
    });

    for (const item of lineItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } }
      });
    }

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } }, address: true }
    });
  });

  return res.status(201).json(created);
});

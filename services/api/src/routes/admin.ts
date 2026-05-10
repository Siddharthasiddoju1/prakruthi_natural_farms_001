import { Router } from "express";
import { prisma } from "../lib/prisma";
import { ensureSeedProducts } from "../lib/seed";
import { requireAdmin } from "../middleware/admin";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

function normalizeDateRange(dateInput?: string) {
  const day = dateInput ? new Date(dateInput) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function csvEscape(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }
  return text;
}

adminRouter.post("/bootstrap", async (req, res) => {
  const { force } = req.body as { force?: boolean };
  const result = await ensureSeedProducts(Boolean(force));
  return res.json(result);
});

adminRouter.post("/products", async (req, res) => {
  const { name, category, description, price, unit, stockQty, organicTag, isActive } = req.body as {
    name?: string;
    category?: string;
    description?: string;
    price?: number;
    unit?: string;
    stockQty?: number;
    organicTag?: string;
    isActive?: boolean;
  };

  if (!name?.trim() || !category?.trim() || !unit?.trim() || typeof price !== "number") {
    return res.status(400).json({ message: "name, category, unit and numeric price are required" });
  }

  const created = await prisma.product.create({
    data: {
      name: name.trim(),
      category: category.trim(),
      description,
      price,
      unit: unit.trim(),
      stockQty: Number(stockQty ?? 0),
      organicTag,
      isActive: isActive ?? true
    }
  });

  return res.status(201).json(created);
});

adminRouter.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  const [inOrders, inSubscriptions, inCart] = await Promise.all([
    prisma.orderItem.count({ where: { productId } }),
    prisma.subscription.count({ where: { productId } }),
    prisma.cartItem.count({ where: { productId } })
  ]);

  const hasReferences = inOrders > 0 || inSubscriptions > 0 || inCart > 0;

  if (hasReferences) {
    const softDeleted = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false, stockQty: 0 }
    });
    return res.json({ mode: "soft-delete", product: softDeleted });
  }

  await prisma.product.delete({ where: { id: productId } });
  return res.json({ mode: "hard-delete", productId });
});

adminRouter.get("/overview", async (_req, res) => {
  const [products, activeSubscriptions, ordersToday, customers] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.customer.count()
  ]);

  return res.json({ products, activeSubscriptions, ordersToday, customers });
});

adminRouter.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      address: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return res.json(orders);
});

adminRouter.patch("/orders/:id/status", async (req, res) => {
  const { status } = req.body as { status?: "PLACED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" };

  if (!status) return res.status(400).json({ message: "status is required" });
  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { orderStatus: status }
  });

  return res.json(updated);
});

adminRouter.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return res.json(products);
});

adminRouter.patch("/products/:id", async (req, res) => {
  const { price, stockQty, isActive } = req.body as {
    price?: number;
    stockQty?: number;
    isActive?: boolean;
  };

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      price,
      stockQty,
      isActive
    }
  });

  return res.json(updated);
});

adminRouter.get("/delivery-list/export", async (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const format = typeof req.query.format === "string" ? req.query.format : "csv";
  const { start, end } = normalizeDateRange(date);
  const labelDate = start.toISOString().slice(0, 10);

  const [orders, subscriptions] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { customer: true, address: true, items: { include: { product: true } } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        customer: {
          include: {
            addresses: { where: { isDefault: true }, take: 1 }
          }
        },
        product: true
      },
      orderBy: { startDate: "asc" }
    })
  ]);

  const rows = [
    ...orders.map((order) => ({
      type: "ORDER",
      refId: order.id,
      customerName: order.customer.name,
      mobile: order.customer.mobile,
      area: order.address.area,
      city: order.address.city,
      pincode: order.address.pincode,
      line1: order.address.line1,
      deliverySlot: order.deliverySlot || "Morning",
      status: order.orderStatus,
      notes: order.items.map((item) => `${item.product.name} x${item.quantity}`).join("; ")
    })),
    ...subscriptions.map((subscription) => {
      const address = subscription.customer.addresses[0];
      return {
        type: "SUBSCRIPTION",
        refId: subscription.id,
        customerName: subscription.customer.name,
        mobile: subscription.customer.mobile,
        area: address?.area || "",
        city: address?.city || "",
        pincode: address?.pincode || "",
        line1: address?.line1 || "",
        deliverySlot: subscription.morningDelivery ? "Morning" : "Flexible",
        status: subscription.status,
        notes: `${subscription.product.name} ${subscription.quantityLiters}L ${subscription.scheduleType}`
      };
    })
  ];

  if (format.toLowerCase() === "json") {
    return res.json({ date: labelDate, count: rows.length, rows });
  }

  const header = [
    "type",
    "refId",
    "customerName",
    "mobile",
    "area",
    "city",
    "pincode",
    "line1",
    "deliverySlot",
    "status",
    "notes"
  ];
  const csvLines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.type,
        row.refId,
        row.customerName,
        row.mobile,
        row.area,
        row.city,
        row.pincode,
        row.line1,
        row.deliverySlot,
        row.status,
        row.notes
      ]
        .map(csvEscape)
        .join(",")
    )
  ];

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="daily-delivery-list-${labelDate}.csv"`);
  return res.send(csvLines.join("\n"));
});

adminRouter.get("/subscriptions", async (_req, res) => {
  const subscriptions = await prisma.subscription.findMany({
    include: { customer: true, product: true },
    orderBy: { startDate: "desc" },
    take: 100
  });
  return res.json(subscriptions);
});

adminRouter.get("/customers", async (_req, res) => {
  const customers = await prisma.customer.findMany({
    include: { addresses: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return res.json(customers);
});

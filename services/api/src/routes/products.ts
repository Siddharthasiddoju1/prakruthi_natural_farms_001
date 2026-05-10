import { Router } from "express";
import { prisma } from "../lib/prisma";

export const productsRouter = Router();

productsRouter.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({ where: { isActive: true } });
    return res.json(products);
  } catch {
    return res.json([
      { id: "p1", name: "A2 Cow Milk", price: 78, unit: "liter", stockQty: 120, organicTag: "Natural" },
      { id: "p2", name: "Fresh Curd", price: 65, unit: "500g", stockQty: 80, organicTag: "Organic" }
    ]);
  }
});

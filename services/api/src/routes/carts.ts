import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const cartsRouter = Router();

cartsRouter.use(requireAuth);

async function getOrCreateCart(customerId: string) {
  const existing = await prisma.cart.findFirst({ where: { customerId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { customerId } });
}

cartsRouter.get("/", async (req, res) => {
  const cart = await getOrCreateCart(req.user!.id);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true }
  });
  return res.json({ cart, items });
});

cartsRouter.post("/items", async (req, res) => {
  const { productId, quantity, itemType } = req.body as {
    productId?: string;
    quantity?: number;
    itemType?: "ONE_TIME" | "SUBSCRIPTION";
  };

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: "productId and quantity are required" });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = await getOrCreateCart(req.user!.id);
  const normalizedType = itemType === "SUBSCRIPTION" ? "SUBSCRIPTION" : "ONE_TIME";

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, itemType: normalizedType }
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      })
    : await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, itemType: normalizedType }
      });

  return res.status(201).json(item);
});

cartsRouter.patch("/items/:id", async (req, res) => {
  const { quantity } = req.body as { quantity?: number };

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "quantity must be >= 1" });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { id: req.params.id, cart: { customerId: req.user!.id } }
  });
  if (!existing) return res.status(404).json({ message: "Cart item not found" });

  const updated = await prisma.cartItem.update({
    where: { id: req.params.id },
    data: { quantity }
  });

  return res.json(updated);
});

cartsRouter.delete("/items/:id", async (req, res) => {
  const existing = await prisma.cartItem.findFirst({
    where: { id: req.params.id, cart: { customerId: req.user!.id } }
  });
  if (!existing) return res.status(404).json({ message: "Cart item not found" });

  await prisma.cartItem.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

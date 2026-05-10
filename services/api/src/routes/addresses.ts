import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export const addressesRouter = Router();

addressesRouter.use(requireAuth);

addressesRouter.get("/", async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { customerId: req.user!.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }]
  });
  return res.json(addresses);
});

addressesRouter.post("/", async (req, res) => {
  const { line1, line2, landmark, area, city, pincode, isDefault } = req.body as {
    line1?: string;
    line2?: string;
    landmark?: string;
    area?: string;
    city?: string;
    pincode?: string;
    isDefault?: boolean;
  };

  if (!line1 || !area || !city || !pincode) {
    return res.status(400).json({ message: "line1, area, city and pincode are required" });
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { customerId: req.user!.id, isDefault: true },
      data: { isDefault: false }
    });
  }

  const created = await prisma.address.create({
    data: {
      customerId: req.user!.id,
      line1,
      line2,
      landmark,
      area,
      city,
      pincode,
      isDefault: Boolean(isDefault)
    }
  });

  return res.status(201).json(created);
});

addressesRouter.put("/:id", async (req, res) => {
  const payload = req.body as {
    line1?: string;
    line2?: string;
    landmark?: string;
    area?: string;
    city?: string;
    pincode?: string;
    isDefault?: boolean;
  };

  const existing = await prisma.address.findFirst({
    where: { id: req.params.id, customerId: req.user!.id }
  });
  if (!existing) return res.status(404).json({ message: "Address not found" });

  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { customerId: req.user!.id, isDefault: true },
      data: { isDefault: false }
    });
  }

  const updated = await prisma.address.update({
    where: { id: req.params.id },
    data: payload
  });
  return res.json(updated);
});

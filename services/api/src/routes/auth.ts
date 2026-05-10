import { Router } from "express";
import { requireAuth, signAccessToken } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createOtp, verifyOtp } from "../store/otp-store";

export const authRouter = Router();

authRouter.post("/request-otp", (req, res) => {
  const { mobile } = req.body as { mobile?: string };

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Mobile must be a valid 10-digit number" });
  }

  const otpData = createOtp(mobile);
  return res.json({
    message: "OTP sent",
    otp: process.env.OTP_PROVIDER === "mock" ? otpData.otp : undefined,
    expiresAt: otpData.expiresAt
  });
});

authRouter.post("/verify-otp", async (req, res) => {
  const { mobile, otp, name } = req.body as { mobile?: string; otp?: string; name?: string };

  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP are required" });
  }

  const isValidOtp = verifyOtp(mobile, otp);
  if (!isValidOtp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  const customer = await prisma.customer.upsert({
    where: { mobile },
    update: {},
    create: {
      mobile,
      name: name?.trim() || "Prakruthi Customer",
      isVerified: true
    }
  });

  const accessToken = signAccessToken({ id: customer.id, mobile: customer.mobile, role: "customer" });

  return res.json({ accessToken, customer });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.user!.id } });
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  return res.json(customer);
});

authRouter.put("/profile", requireAuth, async (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name?.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const updated = await prisma.customer.update({
      where: { id: req.user!.id },
      data: { name, email }
    });
    return res.json(updated);
  } catch {
    return res.status(404).json({ message: "Customer not found" });
  }
});

import { NextFunction, Request, Response } from "express";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "prakruthi-admin-dev";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"];
  if (typeof key !== "string" || key !== ADMIN_API_KEY) {
    return res.status(401).json({ message: "Unauthorized admin key" });
  }
  return next();
}

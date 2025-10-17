import { Response, NextFunction } from "express";
import { decodeTokenData } from "../services/tokenService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const hasAccess = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const decoded = decodeTokenData(req.token || "");
    const isAdmin = decoded?.realm_access?.roles?.includes("admin");

    if (role === "Admin" && isAdmin) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };
};

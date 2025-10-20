import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { keycloakService } from "../services/keycloakService";

export const hasAccess = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const decoded = keycloakService.decodeTokenData(req.token || "");

    if (decoded?.realm_access?.roles?.includes(role)) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };
};

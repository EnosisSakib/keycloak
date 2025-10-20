import express from "express";
import { extractToken } from "../middlewares/extractToken";
import { hasAccess } from "../middlewares/hasAccess";
import { keycloakService } from "../services/keycloakService";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { Roles } from "../types/roles";

export const router = express.Router();

router.get(
  "/",
  extractToken,
  hasAccess(Roles.Admin),
  async (req: AuthenticatedRequest, res) => {
    try {
      const users = await keycloakService.getUsers();
      res.json({ users });
    } catch (e) {
      console.error("Error fetching users:", e);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

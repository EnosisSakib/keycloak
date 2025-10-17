import express from "express";
import { extractToken } from "../middlewares/extractToken";
import { hasAccess } from "../middlewares/hasAccess";
import { getUsers } from "../services/keycloakService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const router = express.Router();

router.get(
  "/",
  extractToken,
  hasAccess("Admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const users = await getUsers();
      res.json({ users });
    } catch (e) {
      console.error("Error fetching users:", e);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

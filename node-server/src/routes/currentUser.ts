import express from "express";
import { extractToken } from "../middlewares/extractToken";
import { keycloakService } from "../services/keycloakService";
import { AuthenticatedRequest } from "../types/authenticatedRequest";

export const router = express.Router();

router.post("/", extractToken, async (req: AuthenticatedRequest, res) => {
  try {
    const token = req.token;
    if (token) {
      const decodeToken = keycloakService.decodeTokenData(token);
      return res.json({ decodeToken });
    }
  } catch (e) {
    console.error("Error decoding token", e);
    res.status(500).json({ error: "Failed to decode token" });
  }
});

import express from "express";
import { router as userRoutes } from "./userRoutes";
import { extractToken } from "../middlewares/extractToken";
import { decodeTokenData } from "../services/tokenService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const router = express.Router();

router.get("/", (req, res) => {
  res.send("Node + Keycloak server running");
});

router.post("/", extractToken, (req: AuthenticatedRequest, res) => {
  const token = req.token;
  if (token) {
    const decodeToken = decodeTokenData(token);
    return res.json({ decodeToken });
  }
});

router.use("/users", userRoutes);

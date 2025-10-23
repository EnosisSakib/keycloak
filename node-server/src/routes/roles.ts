import express from "express";
import { extractToken } from "../middlewares/extractToken";
import { hasAccess } from "../middlewares/hasAccess";
import { keycloakService } from "../services/keycloakService";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { Roles } from "../types/roles";
import { Response } from "express";

export const router = express.Router();

router.get("/", extractToken, hasAccess(Roles.Admin), getRoles);
router.post("/", extractToken, hasAccess(Roles.Admin), addRole);
router.get("/user:uid", extractToken, hasAccess(Roles.Admin), getUserRole);
router.get("/user:uid/available", extractToken, hasAccess(Roles.Admin), getUserAvailableRole);
router.post("/user:uid/addrole", extractToken, hasAccess(Roles.Admin), addUserRole);
router.delete("/user:uid/removerole", extractToken, hasAccess(Roles.Admin), removeUserRole);

async function addUserRole(req: AuthenticatedRequest, res: Response) {
  console.log(req.params.uid);
  try {
    const roles = await keycloakService.addUserRole(req.params.uid, req.body);
    res.json(roles);
  } catch (e) {
    console.error("Error fetching roles:", e);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
}

async function removeUserRole(req: AuthenticatedRequest, res: Response) {
  console.log(req.params.uid);
  try {
    const roles = await keycloakService.removeUserRole(req.params.uid, req.body);
    res.json(roles);
  } catch (e) {
    console.error("Error fetching roles:", e);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
}

async function getUserAvailableRole(req: AuthenticatedRequest, res: Response) {
  try {
    const roles = await keycloakService.getUserAvailableRole(req.params.uid);
    res.json(roles);
  } catch (e) {
    console.error("Error fetching roles:", e);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
}
async function getUserRole(req: AuthenticatedRequest, res: Response) {
  try {
    const roles = await keycloakService.getUserRole(req.params.uid);
    res.json(roles);
  } catch (e) {
    console.error("Error fetching roles:", e);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
}

async function getRoles(req: AuthenticatedRequest, res: Response) {
  try {
    const roles = await keycloakService.getRoles();
    res.json(roles);
  } catch (e) {
    console.error("Error fetching roles:", e);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
}

async function addRole(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description } = req.body;
    const roles = await keycloakService.addRole(name, description);
    res.json(roles);
  } catch (e) {
    console.error("Error adding roles:", e);
    res.status(500).json({ error: "Failed to add roles" });
  }
}

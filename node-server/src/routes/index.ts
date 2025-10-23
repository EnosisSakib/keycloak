import express from "express";
import { router as userRoutes } from "./userRoutes";
import { router as currentuserRouters } from "./currentUser";
import { router as roleRoutes } from "./roles";
export const router = express.Router();

router.get("/", (req, res) => {
  res.send("Node + Keycloak server running");
});

router.use("/currentuser", currentuserRouters);

router.use("/users", userRoutes);

router.use("/roles", roleRoutes);

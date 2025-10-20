import express from "express";
import { router as userRoutes } from "./userRoutes";
import { router as currentuserRouters } from "./currentUser";

export const router = express.Router();

router.get("/", (req, res) => {
  res.send("Node + Keycloak server running");
});

router.post("/currentuser", currentuserRouters);

router.use("/users", userRoutes);

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";

export const extractToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const [authScheme, token] = authHeader.split(" ");

    if (!token) return res.status(403).json({ error: "Token missing" });

    req.token = token;
    next();
  } else {
    res.status(403).json({ error: "Authorization header missing" });
  }
};

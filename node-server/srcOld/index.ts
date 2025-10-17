import express, { Request, Response, NextFunction, raw } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
const jwt = require("jsonwebtoken");

let keycloak_token: string = "no token";
dotenv.config();

const memoryStore = new session.MemoryStore();

const app = express();
app.use(
  cors({
    origin: [process.env.WEB_ORIGIN || ""],
    credentials: true,
  })
);
app.use(
  session({
    secret: "some-secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);
app.use(express.json());
const PORT = process.env.PORT || 3000;

interface AuthenticatedRequest extends Request {
  token?: string;
}

const extractToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (typeof authHeader !== "undefined") {
    const bearer = authHeader.split(" ");
    const token = bearer[1];

    if (!token) {
      return res
        .status(403)
        .json({ error: "Token missing in Authorization header" });
    }

    req.token = token;
    next();
  } else {
    res.status(403).json({ error: "Authorization header missing" });
  }
};

app.get("/", async (req: Request, res: Response) => {
  res.send("Node + Keycloak server running");
});

app.post(
  "/",
  extractToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const token = req.token;
      if (token) keycloak_token = token;
      const decodeToken = decodeTokenData(token || "");
      return res.json({ decodeToken });
    } catch (e) {
      console.log(e);
    }
  }
);

function decodeTokenData(token: string) {
  const rsa256key = `-----BEGIN PUBLIC KEY-----\n${process.env.RSA_256_KEY}\n-----END PUBLIC KEY-----\n`;
  const decodedToken = jwt.verify(token, rsa256key, {
    algorithms: ["RS256"],
  });

  return decodedToken;
}

app.get("/gettoken", (req, res) => {
  res.json({ token: keycloak_token });
});

async function getServiceAccountToken() {
  const params = new URLSearchParams();
  // params.append("grant_type", "password");
  params.append("grant_type", "client_credentials");
  params.append("client_id", "nodeclient");
  // params.append("username", "admin");
  // params.append("password", "admin");
  params.append("client_secret", process.env.NODE_CLIENT_SECRET || "");

  const res = await fetch(
    `${process.env.KEYCLOAK_URL}/realms/myrealm/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  const data = await res.json();
  return data.access_token;
}

async function getUsers() {
  try {
    const newToken = await getServiceAccountToken();

    const response = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/myrealm/users`,
      {
        headers: {
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const users = await response.json();
    return users;
  } catch (e) {
    console.log("fetch user error: ", e);
  }
}

const hasAccess = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const decodedToken = decodeTokenData(req.token || "");
    const userRole = decodedToken?.realm_access?.roles?.includes("admin")
      ? "Admin"
      : "User";

    if (userRole.includes(role)) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };
};

app.get(
  "/users",
  extractToken,
  hasAccess("Admin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const token = req.token;
      const users = await getUsers();
      res.json({ users });
    } catch (e) {
      console.log(e);
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

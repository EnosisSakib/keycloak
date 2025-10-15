import express, { Request, Response, NextFunction, raw } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
// import Keycloak from "keycloak-connect";
const jwt = require("jsonwebtoken");

let keycloak_token: string = "no token";
dotenv.config();

const memoryStore = new session.MemoryStore();

// const kcConfig = {
//   realm: "myrealm",
//   "auth-server-url": "http://keycloak:8080/",
//   "ssl-required": "none",
//   resource: "myclient",
//   "bearer-only": true,
//   // credentials: {
//   //   secret: "kGNQxUeAwzyjnqXX2EXRvroliNQ0ElIu",
//   // },
//   "confidential-port": 0,
// };

// const keycloak = new Keycloak({ store: memoryStore }, kcConfig);

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:1122"],
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

// app.use(keycloak.middleware());

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
      const rsa256key =
        "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvjuH9aBjjt4cmlhYZiARmARKU3GTulNcWF+BsWzE/rQOpltV3SlI70i56dQ9StJGyNTKFT89f64MyBz7lvHunj2fYG/WMCPkKXQKyvM7pr3bSVrU9xTRJh8czmGm9bY+12lyFvTn2SnfFAeAp9/hXBFw8IWemZvbEoF6lI+FYaN1MleIBY3IYZ0bMQOaBgFjaqRB45S8Hc0NK3lhEW2MqX04bZkD/7LRiBywZYENwkQ1eGt8i+fzeU9UxvX3nZU2HEnCGDjRuoUT24GJflK5BRWpiIwCGnPPZsxLgfM29DkRC3lIh319XUTsw01dZQgvhbVHjlktKrJBrcUWqnvgRwIDAQAB\n-----END PUBLIC KEY-----\n";
      const decodeToken = jwt.verify(token, rsa256key, {
        algorithms: ["RS256"],
      });
      return res.json({ decodeToken });
    } catch (e) {
      console.log(e);
    }
  }
);

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
  params.append("client_secret", "v8Z9mTdKACG7rORIlWBMVOl2y9n9D2xC");

  const res = await fetch(
    "http://keycloak:8080/realms/myrealm/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  const data = await res.json();
  return data.access_token;
}

async function getUsers(token: any) {
  try {
    console.log("-------------------- new token: ");
    const newToken = await getServiceAccountToken();
    console.log(newToken);

    const response = await fetch(
      `http://keycloak:8080/admin/realms/myrealm/users`,
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

app.get(
  "/users",
  extractToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const token = req.token;
      const users = await getUsers(token);
      res.json({ users });
    } catch (e) {
      console.log(e);
    }
    // res.json({ message: "You are authenticated with Keycloak" });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express, { Request, Response } from "express";
import cors from "cors";
// import { getUsers } from "./keycloakClient";
import dotenv from "dotenv";
import session from "express-session";
import Keycloak from "keycloak-connect";

dotenv.config();

const memoryStore = new session.MemoryStore();

const kcConfig = {
  realm: "myrealm",
  "auth-server-url": "http://localhost:8080/",
  "ssl-required": "external",
  resource: "myclient",
  "bearer-only": true,
  credentials: {
    secret: "F1xGzLbA89QhgRd4EAvm6WC7NZqzvYRB",
  },
  "confidential-port": 0,
};

const keycloak = new Keycloak({ store: memoryStore }, kcConfig);

const app = express();
app.use(cors());
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

app.use(keycloak.middleware());

app.get("/", async (req: Request, res: Response) => {
  res.send("Node + Keycloak server running");
});

app.get("/users", keycloak.protect(), (req, res) => {
  res.json({ message: "You are authenticated with Keycloak" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { router as apiRouter } from "./routes";
dotenv.config();

const app = express();
const memoryStore = new session.MemoryStore();

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

app.use("/", apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

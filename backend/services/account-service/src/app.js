import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler, correlationIdMiddleware } from "@bank/shared";
import accountRouter from "./routes/account.routes.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(correlationIdMiddleware);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "account-service" });
});

app.use("/api/accounts", accountRouter);

// Central error handler
app.use(errorHandler);

export { app };

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler, correlationIdMiddleware } from "@bank/shared";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createAuthController } from "./controllers/auth.controller.js";

export const createApp = (eventBus) => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));
  app.use(cookieParser());
  app.use(correlationIdMiddleware);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", service: "auth-service" });
  });

  const authController = createAuthController(eventBus);
  const authRouter = createAuthRouter(authController);

  app.use("/api/auth", authRouter);

  // Central error handler
  app.use(errorHandler);

  return app;
};

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { correlationIdMiddleware, errorHandler } from "@bank/shared";

const app = express();
const port = process.env.PORT || process.env.GATEWAY_PORT || 8080;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || "http://localhost:5002";
const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || "http://localhost:5003";

app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware);

// 🛡️ Security Filter: Block external requests to internal microservice endpoints
app.use((req, res, next) => {
  if (req.originalUrl.includes("/internal/")) {
    return res.status(403).json({
      statusCode: 403,
      message: "Forbidden: Internal endpoints cannot be accessed from API Gateway",
      success: false,
    });
  }
  next();
});

// Gateway Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    gateway: "API Gateway",
    services: {
      auth: AUTH_SERVICE_URL,
      account: ACCOUNT_SERVICE_URL,
      transaction: TRANSACTION_SERVICE_URL,
    },
  });
});

// 🔀 Proxy /api/auth -> Auth Service
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
    on: {
      proxyReq: fixRequestBody,
      error: (err, req, res) => {
        console.error("Auth proxy error:", err.message);
        res.status(503).json({ statusCode: 503, message: "Auth Service unavailable", success: false });
      },
    },
  })
);

// 🔀 Proxy /api/accounts -> Account Service
app.use(
  "/api/accounts",
  createProxyMiddleware({
    target: ACCOUNT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
    on: {
      proxyReq: fixRequestBody,
      error: (err, req, res) => {
        console.error("Account proxy error:", err.message);
        res.status(503).json({ statusCode: 503, message: "Account Service unavailable", success: false });
      },
    },
  })
);

// 🔀 Proxy /api/transactions -> Transaction Service
app.use(
  "/api/transactions",
  createProxyMiddleware({
    target: TRANSACTION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
    on: {
      proxyReq: fixRequestBody,
      error: (err, req, res) => {
        console.error("Transaction proxy error:", err.message);
        res.status(503).json({ statusCode: 503, message: "Transaction Service unavailable", success: false });
      },
    },
  })
);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    success: false,
  });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`🌐 [API Gateway] running on http://localhost:${port}`);
  console.log(`  ├── /api/auth/*         ──> ${AUTH_SERVICE_URL}`);
  console.log(`  ├── /api/accounts/*     ──> ${ACCOUNT_SERVICE_URL}`);
  console.log(`  └── /api/transactions/* ──> ${TRANSACTION_SERVICE_URL}`);
});

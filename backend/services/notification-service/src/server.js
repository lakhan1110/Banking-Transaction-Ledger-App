import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { verifyEmailTransporter } from "./config/mailer.js";
import { startMailConsumer } from "./consumers/mail.consumer.js";

const app = express();
const port = process.env.NOTIFICATION_SERVICE_PORT || 5004;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "notification-service" });
});

const start = async () => {
  try {
    console.log(`🚀 Starting Notification Service on port ${port}...`);

    await verifyEmailTransporter();
    await startMailConsumer();

    app.listen(port, () => {
      console.log(`✅ [Notification Service] running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start Notification Service:", error?.message || error);
    process.exit(1);
  }
};

start();

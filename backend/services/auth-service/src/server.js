import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { EventBus } from "@bank/shared";
import { createApp } from "./app.js";

const port = process.env.AUTH_SERVICE_PORT || 5001;

const start = async () => {
  try {
    console.log(`🚀 Starting Auth Service on port ${port}...`);

    const eventBus = new EventBus(process.env.RABBITMQ_URI);
    const app = createApp(eventBus);

    app.listen(port, () => {
      console.log(`✅ [Auth Service] running on http://localhost:${port}`);
    });

    // Connect infrastructure
    await connectDB();
    await connectRedis();
    await eventBus.connect();
  } catch (error) {
    console.error("❌ Failed to start Auth Service:", error?.message || error);
  }
};

start();

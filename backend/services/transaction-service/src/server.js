import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { EventBus } from "@bank/shared";
import { createApp } from "./app.js";

const port = process.env.TRANSACTION_SERVICE_PORT || 5003;

const start = async () => {
  try {
    console.log(`🚀 Starting Transaction & Ledger Service on port ${port}...`);

    const eventBus = new EventBus(process.env.RABBITMQ_URI);
    const app = createApp(eventBus);

    app.listen(port, () => {
      console.log(`✅ [Transaction Service] running on http://localhost:${port}`);
    });

    await connectDB();
    await connectRedis();
    await eventBus.connect();
  } catch (error) {
    console.error("❌ Failed to start Transaction Service:", error?.message || error);
  }
};

start();

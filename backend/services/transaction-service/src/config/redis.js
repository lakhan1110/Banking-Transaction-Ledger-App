import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

let redisUrl = process.env.REDIS_URI || process.env.REDIS_URL || "redis://localhost:6379";
if (redisUrl.startsWith("redis://") && redisUrl.includes("upstash.io")) {
  redisUrl = redisUrl.replace("redis://", "rediss://");
}

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  console.warn("⚠️ [Transaction Service] Redis error:", err.message);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ [Transaction Service] Upstash Redis connected successfully");
    }
  } catch (error) {
    console.warn("⚠️ [Transaction Service] Redis not connected:", error?.message || error);
  }
};

export default redisClient;

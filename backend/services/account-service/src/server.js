import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import { app } from "./app.js";

const port = process.env.ACCOUNT_SERVICE_PORT || 5002;

const start = async () => {
  try {
    console.log(`🚀 Starting Account Service on port ${port}...`);

    app.listen(port, () => {
      console.log(`✅ [Account Service] running on http://localhost:${port}`);
    });

    await connectDB();
  } catch (error) {
    console.error("❌ Failed to start Account Service:", error?.message || error);
  }
};

start();

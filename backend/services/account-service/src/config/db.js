import mongoose from "mongoose";
import dns from "node:dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // ignore
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    const dbName = process.env.ACCOUNT_DB_NAME || "bank_account";
    const uri = `${mongoUri.replace(/\/$/, "")}/${dbName}?retryWrites=true&w=majority`;

    const connectionInstance = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ [Account Service] MongoDB connected! DB: ${dbName} Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.warn("⚠️ [Account Service] MongoDB connection warning:", error.message);
  }
};

export default connectDB;

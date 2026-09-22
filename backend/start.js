import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  { name: "gateway", script: "services/gateway/src/server.js" },
  { name: "auth", script: "services/auth-service/src/server.js" },
  { name: "account", script: "services/account-service/src/server.js" },
  { name: "transaction", script: "services/transaction-service/src/server.js" },
  { name: "notification", script: "services/notification-service/src/server.js" },
];

console.log("🚀 Initializing Nexus Bank Microservices cluster...");

const children = [];

for (const svc of services) {
  const scriptPath = path.resolve(__dirname, svc.script);
  const child = spawn(process.execPath, [scriptPath], {
    cwd: __dirname,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${svc.name}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${svc.name}] ${data}`);
  });

  child.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ [${svc.name}] process exited unexpectedly with code ${code}`);
    }
  });

  children.push(child);
}

const cleanup = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down all services gracefully...`);
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
  process.exit(0);
};

process.on("SIGINT", () => cleanup("SIGINT"));
process.on("SIGTERM", () => cleanup("SIGTERM"));

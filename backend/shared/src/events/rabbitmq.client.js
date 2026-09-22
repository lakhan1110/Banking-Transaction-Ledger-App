import amql from "amqplib";

export class EventBus {
  constructor(uri, exchangeName = "bank_events") {
    this.uri = uri;
    this.exchangeName = exchangeName;
    this.connection = null;
    this.channel = null;
  }

  async connect(retries = 2, delayMs = 1000) {
    const uri = this.uri || process.env.RABBITMQ_URI || "amqp://admin:admin123@localhost:5672";

    while (retries > 0) {
      try {
        console.log(`🔌 EventBus connecting to RabbitMQ (${uri})...`);
        this.connection = await amql.connect(uri);
        this.channel = await this.connection.createConfirmChannel();
        await this.channel.assertExchange(this.exchangeName, "topic", { durable: true });

        this.connection.on("error", (err) => {
          console.error("❌ RabbitMQ connection error:", err.message);
        });

        this.connection.on("close", () => {
          console.warn("⚠️ RabbitMQ connection closed.");
        });

        console.log("✅ EventBus connected to RabbitMQ");
        return;
      } catch (err) {
        console.warn(`⏳ RabbitMQ not ready, retrying in ${delayMs / 1000}s (${retries} attempts left)...`);
        retries--;
        if (retries > 0) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }
    console.warn("⚠️ RabbitMQ connection skipped (running in offline mode)");
  }

  async publish(routingKey, message, options = { persistent: true }) {
    if (!this.channel) {
      console.log(`ℹ️ [EventBus Offline] Event simulated: [${routingKey}]`);
      return;
    }
    try {
      const payload = typeof message === "string" ? message : JSON.stringify(message);
      this.channel.publish(this.exchangeName, routingKey, Buffer.from(payload), options);
      console.log(`📤 Event published: [${routingKey}]`);
    } catch (error) {
      console.error(`❌ Failed to publish event [${routingKey}]:`, error.message || error);
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (e) {
      // ignore
    }
  }
}

import amql from "amqplib";
import { EventTypes } from "@bank/shared";
import { sendEmail } from "../services/email.service.js";
import {
  sendRegistrationEmail,
  sendOtpEmail,
  sendDebitEmail,
  sendCreditEmail,
  sendTransactionFailureEmail,
} from "../templates/mail.templates.js";

const EXCHANGE_NAME = "bank_events";
const MAIL_QUEUE = process.env.MAIL_QUEUE_NAME || "mail_queue";
const RETRY_QUEUE = process.env.MAIL_RETRY_QUEUE || "mail_retry_queue";
const DLQ_QUEUE = process.env.MAIL_DLQ_QUEUE || "mail_dlq";

const MAX_ATTEMPTS = Number(process.env.MAIL_MAX_ATTEMPTS) || 3;
const RETRY_DELAY_MS = Number(process.env.MAIL_RETRY_DELAY_MS) || 5000;

export const startMailConsumer = async () => {
  const uri = process.env.RABBITMQ_URI || "amqp://admin:admin123@localhost:5672";
  let retries = 2;

  while (retries > 0) {
    try {
      console.log(`🔌 [Notification Service] Connecting to RabbitMQ (${uri})...`);
      const connection = await amql.connect(uri);
      const channel = await connection.createConfirmChannel();

      channel.on("error", (err) => console.error("❌ Channel error:", err.message));
      channel.on("close", () => console.warn("⚠️ Channel closed"));

      channel.prefetch(1);

      // 1. Topic Exchange
      await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

      // 2. Dead Letter Queue
      await channel.assertQueue(DLQ_QUEUE, { durable: true });

      // 3. Retry Queue
      await channel.assertQueue(RETRY_QUEUE, {
        durable: true,
        arguments: {
          "x-message-ttl": RETRY_DELAY_MS,
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": MAIL_QUEUE,
        },
      });

      // 4. Main Mail Queue
      await channel.assertQueue(MAIL_QUEUE, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": RETRY_QUEUE,
        },
      });

      await channel.bindQueue(MAIL_QUEUE, EXCHANGE_NAME, "auth.*");
      await channel.bindQueue(MAIL_QUEUE, EXCHANGE_NAME, "transaction.*");

      console.log(`📬 [Notification Service] Listening on queue: ${MAIL_QUEUE}`);

      channel.consume(
        MAIL_QUEUE,
        async (msg) => {
          if (!msg) return;

          const headers = msg.properties?.headers || {};
          let routingKey = headers.originalRoutingKey || msg.fields?.routingKey;
          const attempts = Number(headers.attempts || 0);

          try {
            const payload = JSON.parse(msg.content.toString());
            const recipient = payload.userEmail || payload.email || "Unknown";

            // Fallback: If routingKey was overridden by dead-letter retry
            if (!routingKey || routingKey === MAIL_QUEUE) {
              if (payload.otp) routingKey = EventTypes.AUTH_OTP_REQUESTED;
              else if (payload.email && payload.name && !payload.amount) routingKey = EventTypes.AUTH_USER_REGISTERED;
              else if (payload.reason) routingKey = EventTypes.TRANSACTION_FAILED;
              else if (payload.amount) routingKey = EventTypes.TRANSACTION_COMPLETED;
            }

            console.log(`📥 [Notification Service] Processing event [${routingKey}] for ${recipient} (Type: ${payload.type || "N/A"})`);

            let emailData = null;

            switch (routingKey) {
              case EventTypes.AUTH_USER_REGISTERED:
                emailData = sendRegistrationEmail(payload.email, payload.name);
                break;

              case EventTypes.AUTH_OTP_REQUESTED:
                emailData = sendOtpEmail(payload.email, payload.name, payload.otp, payload.ttlMinutes);
                break;

              case EventTypes.TRANSACTION_COMPLETED:
              case EventTypes.INITIAL_FUNDS_ADDED:
                if (payload.type === "credit") {
                  emailData = sendCreditEmail(
                    payload.userEmail,
                    payload.userName || "Customer",
                    payload.amount,
                    payload.fromAccount,
                    payload.toAccount
                  );
                } else {
                  emailData = sendDebitEmail(
                    payload.userEmail,
                    payload.userName || "Customer",
                    payload.amount,
                    payload.fromAccount,
                    payload.toAccount
                  );
                }
                break;

              case EventTypes.TRANSACTION_FAILED:
                emailData = sendTransactionFailureEmail(
                  payload.userEmail,
                  payload.userName || "Customer",
                  payload.amount,
                  payload.toAccount,
                  payload.reason
                );
                break;

              default:
                console.log(`ℹ️ [Notification Service] Unhandled routing key: ${routingKey}`);
                break;
            }

            if (emailData && emailData.to) {
              await sendEmail(emailData.to, emailData.subject, emailData.text, emailData.html);
            }

            channel.ack(msg);
          } catch (err) {
            console.error(`❌ [Notification Service] Processing error for [${routingKey}]:`, err?.message || err);

            if (attempts + 1 >= MAX_ATTEMPTS) {
              try {
                channel.sendToQueue(DLQ_QUEUE, msg.content, {
                  persistent: true,
                  headers: { ...headers, attempts: attempts + 1, originalRoutingKey: routingKey, error: err.message },
                });
                channel.ack(msg);
              } catch (dlqErr) {
                channel.nack(msg, false, false);
              }
            } else {
              try {
                channel.sendToQueue(RETRY_QUEUE, msg.content, {
                  persistent: true,
                  expiration: String(RETRY_DELAY_MS),
                  headers: { ...headers, attempts: attempts + 1, originalRoutingKey: routingKey },
                });
                channel.ack(msg);
              } catch (retryErr) {
                channel.nack(msg, false, false);
              }
            }
          }
        },
        { noAck: false }
      );

      return;
    } catch (error) {
      retries--;
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  console.warn("⚠️ [Notification Service] RabbitMQ not reachable (running in standby mode)");
};

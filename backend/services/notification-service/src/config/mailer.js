import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import nodemailer from "nodemailer";

const authConfig = process.env.EMAIL_PASS
  ? {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  : {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    };

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: authConfig,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false,
  },
});

export const verifyEmailTransporter = async () => {
  try {
    await transporter.verify();
    console.log("✅ [Notification Service] Email transporter is 100% READY & AUTHENTICATED");
  } catch (error) {
    console.warn("⚠️ [Notification Service] Email transporter warning:", error.message);
  }
};

export { transporter };

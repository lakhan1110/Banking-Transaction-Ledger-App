import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const isOAuthMode = Boolean(
  process.env.CLIENT_ID &&
  process.env.CLIENT_SECRET &&
  process.env.REFRESH_TOKEN
);

let cachedAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Fetch a valid Google OAuth2 Access Token via HTTPS (Port 443).
 * Cached automatically in memory until expiration.
 */
export const getGoogleAccessToken = async () => {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: process.env.REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Failed to exchange Google OAuth2 refresh token");
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedAccessToken;
};

// Fallback SMTP Transporter (used if EMAIL_PASS is configured instead of OAuth2)
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
  tls: { rejectUnauthorized: false },
});

export const verifyEmailTransporter = async () => {
  if (isOAuthMode) {
    try {
      const token = await getGoogleAccessToken();
      const profileRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        console.log("✅ [Notification Service] Gmail REST API is 100% READY & AUTHENTICATED via HTTPS (Port 443)");
        return;
      }
    } catch (err) {
      console.warn("⚠️ [Notification Service] Gmail REST API verification error:", err.message);
    }
  }

  try {
    await transporter.verify();
    console.log("✅ [Notification Service] Email transporter is READY via SMTP");
  } catch (error) {
    console.warn("⚠️ [Notification Service] Email transporter warning:", error.message);
  }
};

export { transporter };

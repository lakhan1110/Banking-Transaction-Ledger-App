import { isOAuthMode, getGoogleAccessToken, transporter } from "../config/mailer.js";

/**
 * Dispatch email via Gmail REST API over HTTPS (Port 443) or SMTP fallback
 */
export const sendEmail = async (to, subject, text, html) => {
  if (!to) {
    console.warn("⚠️ Cannot send email: recipient address is missing");
    return;
  }

  // 🌐 Primary Delivery Channel: Gmail REST API over HTTPS (Port 443)
  // This completely bypasses SMTP ports (25, 465, 587) firewalled on cloud hosts like Render!
  if (isOAuthMode) {
    try {
      const accessToken = await getGoogleAccessToken();

      const emailContent = [
        `From: "Nexus Bank" <${process.env.EMAIL_USER}>`,
        `To: ${to}`,
        `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        `Content-Transfer-Encoding: 7bit`,
        ``,
        html || text || "",
      ].join("\r\n");

      const encoded = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encoded }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `Gmail API responded with HTTP ${res.status}`);
      }

      console.log(`✉️ [HTTPS 443] Email successfully sent to ${to} (Message ID: ${data.id})`);
      return data;
    } catch (apiError) {
      console.error(`❌ [HTTPS 443] Failed to send email via Gmail API to ${to}:`, apiError.message);
      throw apiError;
    }
  }

  // 🔌 Secondary Channel: Standard SMTP (for environments using EMAIL_PASS)
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger Bank" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️ [SMTP] Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ [SMTP] Failed to send email to ${to}:`, error?.message || error);
    throw error;
  }
};

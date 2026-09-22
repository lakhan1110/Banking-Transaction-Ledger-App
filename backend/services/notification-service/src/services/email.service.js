import { transporter } from "../config/mailer.js";

export const sendEmail = async (to, subject, text, html) => {
  if (!to) {
    console.warn("⚠️ Cannot send email: recipient address is missing");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger Bank" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error?.message || error);
    throw error;
  }
};

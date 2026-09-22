export const sendRegistrationEmail = (userEmail, name) => {
  const subject = "Welcome to Nexus Bank 🎉";
  const text = `Hi ${name},\n\nThank you for registering with Nexus Bank!\n\nBest regards,\nNexus Bank Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#0B0F19; padding:30px; color:#F3F4F6;">
    <div style="max-width:600px; margin:auto; background:#111827; border:1px solid #1F2937; border-radius:12px; overflow:hidden;">
      <div style="background:#10B981; color:#000000; padding:20px; text-align:center;">
        <h2 style="margin:0; font-weight:800;">Welcome to Nexus Bank, ${name}! 🎉</h2>
      </div>
      <div style="padding:25px; text-align:center;">
        <p style="font-size:16px; color:#D1D5DB;">Your digital banking account has been created successfully.</p>
        <p style="margin-top:20px; font-size:13px; color:#6B7280;">Nexus Bank Team</p>
      </div>
    </div>
  </div>`;

  return { to: userEmail, subject, text, html };
};

export const sendOtpEmail = (userEmail, name, otp, ttlMinutes) => {
  const subject = `Nexus Bank Security Verification Code`;
  const text = `Hello ${name},\n\nYour verification code is: ${otp}\nThis code will expire in ${ttlMinutes} minutes.\n\nNexus Bank Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#0B0F19; padding:30px; color:#F3F4F6;">
    <div style="max-width:600px; margin:auto; background:#111827; border:1px solid #1F2937; padding:30px; border-radius:12px;">
      <h2 style="text-align:center; color:#10B981; margin-top:0;">Nexus Bank Security</h2>
      <p style="font-size:15px; color:#D1D5DB;">Hello <b>${name}</b>,</p>
      <p style="font-size:15px; color:#9CA3AF;">Use the one-time verification code below to complete your login:</p>
      <div style="margin:25px 0; padding:18px; background:#0B0F19; border:1px solid #10B981; color:#10B981; font-size:32px; letter-spacing:8px; text-align:center; border-radius:8px; font-weight:bold; font-family:monospace;">
        ${otp}
      </div>
      <p style="font-size:13px; color:#6B7280;">This code will expire in <b>${ttlMinutes} minutes</b>.</p>
    </div>
  </div>`;

  return { to: userEmail, subject, text, html };
};

export const sendDebitEmail = (userEmail, name, amount, fromAccount, toAccount) => {
  const subject = `Debit Alert: ₹${Number(amount).toLocaleString("en-IN")} debited from your account`;
  const text = `Hello ${name},\n\n₹${amount} has been DEBITED from your account ${fromAccount} and transferred to ${toAccount}.\n\nBest regards,\nNexus Bank`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#0B0F19; padding:30px; color:#F3F4F6;">
    <div style="max-width:600px; margin:auto; background:#111827; border:1px solid #1F2937; border-radius:12px; overflow:hidden;">
      <div style="background:#F43F5E; color:#FFFFFF; padding:18px; text-align:center; font-size:18px; font-weight:bold;">
        Debit Alert (Money Sent)
      </div>
      <div style="padding:25px;">
        <h3 style="margin-top:0; color:#FFFFFF;">Hello ${name},</h3>
        <p style="color:#D1D5DB; font-size:14px;">Your account has been debited for the following transfer:</p>
        <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:14px; color:#D1D5DB;">
          <tr>
            <td style="padding:10px; border-bottom:1px solid #1F2937; color:#9CA3AF;">Amount Debited</td>
            <td style="padding:10px; border-bottom:1px solid #1F2937; font-weight:bold; color:#F43F5E; font-size:16px;">-₹${Number(amount).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding:10px; border-bottom:1px solid #1F2937; color:#9CA3AF;">From Account</td>
            <td style="padding:10px; border-bottom:1px solid #1F2937; font-family:monospace;">${fromAccount}</td>
          </tr>
          <tr>
            <td style="padding:10px; border-bottom:1px solid #1F2937; color:#9CA3AF;">To Account</td>
            <td style="padding:10px; border-bottom:1px solid #1F2937; font-family:monospace;">${toAccount}</td>
          </tr>
          <tr>
            <td style="padding:10px; color:#9CA3AF;">Status</td>
            <td style="padding:10px; color:#10B981; font-weight:bold;">COMPLETED</td>
          </tr>
        </table>
      </div>
    </div>
  </div>`;

  return { to: userEmail, subject, text, html };
};

export const sendCreditEmail = (userEmail, name, amount, fromAccount, toAccount) => {
  const subject = `Credit Alert: ₹${Number(amount).toLocaleString("en-IN")} credited to your account 🎉`;
  const text = `Hello ${name},\n\n₹${amount} has been CREDITED to your account ${toAccount} from ${fromAccount}.\n\nBest regards,\nNexus Bank`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#0B0F19; padding:30px; color:#F3F4F6;">
    <div style="max-width:600px; margin:auto; background:#111827; border:1px solid #1F2937; border-radius:12px; overflow:hidden;">
      <div style="background:#10B981; color:#000000; padding:18px; text-align:center; font-size:18px; font-weight:bold;">
        Credit Alert (Money Received) 🎉
      </div>
      <div style="padding:25px;">
        <h3 style="margin-top:0; color:#FFFFFF;">Hello ${name},</h3>
        <p style="color:#D1D5DB; font-size:14px;">Good news! Funds have been credited to your account:</p>
        <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:14px; color:#D1D5DB;">
          <tr>
            <td style="padding:10px; border-bottom:1px solid #1F2937; color:#9CA3AF;">Amount Credited</td>
            <td style="padding:10px; border-bottom:1px solid #1F2937; font-weight:bold; color:#10B981; font-size:16px;">+₹${Number(amount).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding:10px; border-bottom:1px solid #1F2937; color:#9CA3AF;">Credited To</td>
            <td style="padding:10px; border-bottom:1px solid #1F2937; font-family:monospace;">${toAccount}</td>
          </tr>
          <tr>
            <td style="padding:10px; border-bottom:1px solid #1F2937; color:#9CA3AF;">Received From</td>
            <td style="padding:10px; border-bottom:1px solid #1F2937; font-family:monospace;">${fromAccount}</td>
          </tr>
          <tr>
            <td style="padding:10px; color:#9CA3AF;">Status</td>
            <td style="padding:10px; color:#10B981; font-weight:bold;">COMPLETED</td>
          </tr>
        </table>
      </div>
    </div>
  </div>`;

  return { to: userEmail, subject, text, html };
};

export const sendTransactionFailureEmail = (userEmail, name, amount, toAccount, reason) => {
  const subject = "Transaction Alert: Transfer Failed";
  const text = `Hello ${name},\n\nYour attempt to transfer ₹${amount} to account ${toAccount} has failed.\nReason: ${reason}\n\nNexus Bank`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#0B0F19; padding:30px; color:#F3F4F6;">
    <div style="max-width:600px; margin:auto; background:#111827; border:1px solid #1F2937; border-radius:12px; overflow:hidden;">
      <div style="background:#F43F5E; color:white; padding:18px; text-align:center; font-size:18px; font-weight:bold;">
        Transfer Failed
      </div>
      <div style="padding:25px;">
        <h3 style="margin-top:0; color:#FFFFFF;">Hello ${name},</h3>
        <p style="color:#D1D5DB; font-size:14px;">Your transfer of ₹${amount} to account ${toAccount} could not be processed.</p>
        <p style="color:#FCA5A5; background:rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.3); padding:12px; border-radius:8px; font-size:13px;"><b>Reason:</b> ${reason}</p>
      </div>
    </div>
  </div>`;

  return { to: userEmail, subject, text, html };
};

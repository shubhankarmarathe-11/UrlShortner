import nodemailer from "nodemailer";
import { RedisCli } from "./config/redis.ts";

const generateOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

export async function SendMessage(email: string, type: string, data: object) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER || "",
      pass: process.env.GMAIL_PASS || "",
    },
  });

  try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
  } catch (err) {
    console.error("Verification failed:", err);
    return { status: false, message: "" };
  }

  if (type == "otp") {
    try {
      const otp = await generateOtp();
      await RedisCli.set(`${email}otp`, otp, "EX", 60);

      const masked = await email.replace(/(.{2}).+(@.+)/, "$1****$2");

      const info = await transporter.sendMail({
        from: `"${data.appName}" <${process.env.GMAIL_USER}>`, // sender address
        to: email,
        subject: "Verify your Account With Otp",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your OTP Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f4f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Brand Header -->
          <tr>
            <td style="background:#1a1a1a;border-radius:12px 12px 0 0;padding:28px 48px;text-align:center;">
              <span style="color:#f0e9d2;font-size:13px;letter-spacing:4px;text-transform:uppercase;font-weight:600;">${data.appName}</span>
            </td>
          </tr>

          <!-- Alert Strip -->
          <tr>
            <td style="background:#d64f26;padding:10px 48px;text-align:center;">
              <span style="color:#fff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">⚠ Verification Required</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:52px 48px 40px;">

              <p style="margin:0 0 10px;color:#111;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                Your verification code
              </p>
              <p style="margin:0 0 36px;color:#666;font-size:14px;line-height:1.7;">
                Hi <strong style="color:#1a1a1a;">${masked}</strong>, use the code below to complete your verification. Do not share it with anyone.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#f8f6f0;border:2px dashed #d64f26;border-radius:12px;padding:28px 52px;">
                      <p style="margin:0 0 6px;color:#999;font-size:10px;letter-spacing:3px;text-transform:uppercase;">One-Time Password</p>
                      <p style="margin:0;color:#1a1a1a;font-size:48px;font-weight:900;letter-spacing:14px;font-family:'Courier New',monospace;">${otp}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Timer Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                <tr>
                  <td style="background:#fff8f5;border-left:3px solid #d64f26;padding:16px 20px;border-radius:0 8px 8px 0;">
                    <p style="margin:0;color:#d64f26;font-size:13px;font-weight:700;">⏱ Expires in ${await RedisCli.ttl(`${email}otp`)} Seconds</p>
                    <p style="margin:4px 0 0;color:#999;font-size:12px;">After that, you'll need to request a new code.</p>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f8f8f8;border-radius:8px;padding:20px 24px;">
                    <p style="margin:0 0 8px;color:#333;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🔒 Security Notice</p>
                    <p style="margin:0;color:#888;font-size:12px;line-height:1.7;">
                      We will <strong>never</strong> ask for this code via phone or email. If you didn't request this, please ignore this message and consider changing your password.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;border-radius:0 0 12px 12px;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 6px;color:#555;font-size:12px;letter-spacing:0.5px;">
                © 2025 <span style="color:#888;">${data.appName}</span> · All rights reserved
              </p>
              <p style="margin:0;color:#3a3a3a;font-size:11px;">
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      console.log("Message sent: %s", info.messageId);
      // Preview URL is only available when using an Ethereal test account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      return { status: true, message: "email sent" };
    } catch (err) {
      console.error("Error while sending mail:", err);
      return { status: false, message: "" };
    }
  }

  if (type == "welcome") {
    try {
      const info = await transporter.sendMail({
        from: "shubhamkarmarathe2@gmail.com", // sender address
        to: email,
        subject: `Welcome Email from ${data.appName}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f13;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f13;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px 16px 0 0;padding:50px 48px 40px;text-align:center;border-bottom:1px solid #e8c97e33;">
              <div style="display:inline-block;background:linear-gradient(135deg,#e8c97e,#f4d88a);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:24px;">✦</div>
              <h1 style="margin:0 0 8px;color:#e8c97e;font-size:36px;font-weight:normal;letter-spacing:3px;text-transform:uppercase;">Welcome</h1>
              <p style="margin:0;color:#a0b4cc;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Your journey begins here</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#12121a;padding:48px;border-left:1px solid #1e2a3a;border-right:1px solid #1e2a3a;">
              <p style="margin:0 0 20px;color:#c8d8e8;font-size:18px;line-height:1.5;">
                Hello, <strong style="color:#e8c97e;">${email}</strong> 👋
              </p>
              <p style="margin:0 0 28px;color:#8a9bab;font-size:15px;line-height:1.8;">
                We're genuinely thrilled to have you on board. Your account is now active and ready to use. Everything has been set up and waiting for you.
              </p>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,#e8c97e44,transparent);margin:32px 0;"></div>

              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;padding-top:2px;">
                          <div style="width:28px;height:28px;background:#e8c97e18;border:1px solid #e8c97e44;border-radius:6px;text-align:center;line-height:28px;font-size:14px;">⚡</div>
                        </td>
                        <td style="padding-left:14px;">
                          <p style="margin:0 0 4px;color:#e8c97e;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Quick Start</p>
                          <p style="margin:0;color:#7a8a9a;font-size:13px;line-height:1.6;">Log in and explore your dashboard — everything is ready for you from day one.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;padding-top:2px;">
                          <div style="width:28px;height:28px;background:#e8c97e18;border:1px solid #e8c97e44;border-radius:6px;text-align:center;line-height:28px;font-size:14px;">🛡</div>
                        </td>
                        <td style="padding-left:14px;">
                          <p style="margin:0 0 4px;color:#e8c97e;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Secure by Default</p>
                          <p style="margin:0;color:#7a8a9a;font-size:13px;line-height:1.6;">Your data is protected with industry-standard encryption at every step.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;padding-top:2px;">
                          <div style="width:28px;height:28px;background:#e8c97e18;border:1px solid #e8c97e44;border-radius:6px;text-align:center;line-height:28px;font-size:14px;">💬</div>
                        </td>
                        <td style="padding-left:14px;">
                          <p style="margin:0 0 4px;color:#e8c97e;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Always Here</p>
                          <p style="margin:0;color:#7a8a9a;font-size:13px;line-height:1.6;">Our support team is available whenever you need us — just reach out.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,#e8c97e44,transparent);margin:36px 0;"></div>

             
            </td>
          </tr>

          

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      console.log("Message sent: %s", info.messageId);
      // Preview URL is only available when using an Ethereal test account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      return { status: true, message: "email sent" };
    } catch (err) {
      console.error("Error while sending mail:", err);
      return { status: false, message: "" };
    }
  }
}

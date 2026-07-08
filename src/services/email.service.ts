import nodemailer from "nodemailer";
import { google } from "googleapis";
import { env } from "../config/config.js";

const oauth2Client = new google.auth.OAuth2(
  env.SMTP_CLIENT_ID,
  env.SMTP_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: env.SMTP_REFRESH_TOKEN,
});

const createTransporter = async () => {
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: env.SMTP_USER,
      clientId: env.SMTP_CLIENT_ID,
      clientSecret: env.SMTP_CLIENT_SECRET,
      refreshToken: env.SMTP_REFRESH_TOKEN,
      accessToken: accessToken.token!,
    },
  });
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  const transporter =
    await createTransporter();

  await transporter.sendMail({
    from: env.SMTP_USER,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  const verificationUrl =
    `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <h2>Welcome to Klyro 👋</h2>

    <p>Please verify your email by clicking the button below.</p>

    <a
      href="${verificationUrl}"
      style="
        display:inline-block;
        padding:12px 20px;
        background:#2563eb;
        color:#ffffff;
        text-decoration:none;
        border-radius:6px;
      "
    >
      Verify Email
    </a>

    <p>This verification link will expire in 1 hour.</p>

    <p>If you didn't create this account, you can safely ignore this email.</p>
  `;

  await sendEmail(
    email,
    "Verify your email address",
    html
  );
};


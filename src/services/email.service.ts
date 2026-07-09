import nodemailer from "nodemailer";
import { google } from "googleapis";
import { env } from "../config/config.js";
import { verificationTemplate } from "../templates/emails/verification.template.js";
import { resetPasswordTemplate } from "../templates/emails/reset-password.template.js";

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
  const verificationUrl =`${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = verificationTemplate({verificationUrl});

  await sendEmail(
    email,
    "Verify your Klyro account",
    html
  );
};

export const sendResetPasswordEmail = async (
  email: string,
  resetPasswordToken: string
) => {
  const resetPasswordUrl = `${env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;

  const html = resetPasswordTemplate({
    resetPasswordUrl,
  });

  await sendEmail(
    email,
    "Reset your Klyro password",
    html
  );
};









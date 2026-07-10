import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI:process.env.MONGO_URI!,

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,

  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY!,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY!,
  NODE_ENV:process.env.NODE_ENV,

  SMTP_USER: process.env.SMTP_USER!,
  SMTP_CLIENT_ID:process.env.SMTP_CLIENT_ID!,
  SMTP_CLIENT_SECRET:process.env.SMTP_CLIENT_SECRET!,
  SMTP_REFRESH_TOKEN:process.env.SMTP_REFRESH_TOKEN!,

  FRONTEND_URL:process.env.FRONTEND_URL!,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,
};
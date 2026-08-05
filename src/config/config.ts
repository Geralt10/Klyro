import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI:process.env.MONGO_URI!,

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,

  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY!,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY!,
  NODE_ENV:process.env.NODE_ENV,

  //google
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_CLIENT_ID:process.env.SMTP_CLIENT_ID!,
  SMTP_CLIENT_SECRET:process.env.SMTP_CLIENT_SECRET!,
  SMTP_REFRESH_TOKEN:process.env.SMTP_REFRESH_TOKEN!,

  FRONTEND_URL:process.env.FRONTEND_URL!,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,

  //admin
  ADMIN_NAME:process.env.ADMIN_NAME!,
  ADMIN_EMAIL:process.env.ADMIN_EMAIL!,
  ADMIN_PASSWORD:process.env.ADMIN_PASSWORD!,

  //imageKit
  IMAGEKIT_PUBLIC_KEY:process.env.IMAGEKIT_PUBLIC_KEY!,
  IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY!,
  IMAGEKIT_URL_ENDPOINT:process.env.IMAGEKIT_URL_ENDPOINT!,

  RAZORPAY_KEY_ID: z.string().min(1).parse(
    process.env.RAZORPAY_KEY_ID
  ),
  RAZORPAY_KEY_SECRET: z.string().min(1).parse(
    process.env.RAZORPAY_KEY_SECRET
  ),
};

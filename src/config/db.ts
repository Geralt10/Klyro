import mongoose from "mongoose";
import { env } from "./config.js";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed", error);
    process.exit(1);
  }
};
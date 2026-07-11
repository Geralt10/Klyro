import mongoose from "mongoose";
import { env } from "./config.js";
import { logger } from "./logger.js";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);

    logger.info("MongoDB connected successfully.");
  } catch (error) {
    logger.error({err:error},"❌ MongoDB Connection Failed", );
    process.exit(1);
  }
};
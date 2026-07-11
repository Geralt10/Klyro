import mongoose from "mongoose";

import { env } from "../config/config.js";
import { connectDB } from "../config/db.js";
import { logger } from "../config/logger.js";

import { userModel } from "../modules/auth/user.model.js";
import { UserRole } from "../constants/user.js";

const seedAdmin = async () => {
  try {
    logger.info("🌱 Seeding admin...");

    await connectDB();

    const existingAdmin = await userModel.findOne({
      role: UserRole.ADMIN,
    });

    if (existingAdmin) {
      logger.info("ℹ️ Admin already exists.");
      return;
    }

    const admin = new userModel({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: UserRole.ADMIN,
      isVerified: true,
    });

    await admin.save();

    logger.info("✅ Admin created successfully.");
  } catch (error) {
    logger.fatal({ err: error }, "Failed to seed admin.");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    logger.info("📦 Database disconnected.");
  }
};

seedAdmin();
import app from "./app.js";
import { env } from "./config/config.js";
import { connectDB } from "./config/db.js";
import { logger } from "./config/logger.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server.");
    process.exit(1);
  }
};

startServer();
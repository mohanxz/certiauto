import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import initBulkEmailProcessor from "./modules/bulk-email/bulk-email.processor";
import { stopProcessor } from "./modules/bulk-email/bulk-email.processor";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    initBulkEmailProcessor();
    console.log("📨 Bulk Email Processor STARTED");

    const gracefulShutdown = () => {
      console.log("Shutting down gracefully...");
      stopProcessor();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

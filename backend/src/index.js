import dotenv from "dotenv";
import app from "./app.js";
import db_connection from "./db/index.js";
import { connectRedis } from "./config/redis.config.js";
import http from "http"; // for creating server
import { initSocket } from "./Sockets/index.js";
// load environment variables from backend/.env (src is one level deeper)
dotenv.config({ path: "../.env" });

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Connect to database first
    const connection = await db_connection();
    console.log("✅ Database connected:", connection.connection.name);

    // Connect to Redis (required for Socket.IO adapter)
    await connectRedis();

    // Initialize HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO (now async, waits for Redis adapter)
    const io = await initSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Socket.IO ready for connections`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log("✅ HTTP server closed");
        
        if (io) {
          io.close(() => {
            console.log("✅ Socket.IO server closed");
          });
        }
        
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error(
      "❌ Error during server startup:",
      process.env.NODE_ENV === "production" ? error.message : error
    );
    process.exit(1);
  }
};

startServer();

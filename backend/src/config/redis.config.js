import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.error("❌ Redis: Too many reconnection attempts");
        return new Error("Redis reconnection failed");
      }
      return 1000; // Retry after 1 second
    },
  },
});

// Redis event handlers
redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("🔌 Redis: Connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis: Connected and ready");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis: Reconnecting...");
});

redisClient.on("end", () => {
  console.log("⚠️ Redis: Connection closed");
});

// Connect Redis (fail-safe)
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.error(
        "⚠️ Redis connection failed, continuing without Redis:",
        error.message
      );
      // Do not throw → server continues to run
    }
  }
};

// Disconnect Redis gracefully
const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    try {
      await redisClient.quit();
      console.log("✅ Redis: Disconnected gracefully");
    } catch (error) {
      console.error("❌ Redis disconnect error:", error.message);
    }
  }
};

export { redisClient, connectRedis, disconnectRedis };

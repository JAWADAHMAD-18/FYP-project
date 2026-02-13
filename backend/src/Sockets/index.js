import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { socketAuth } from "../middleware/socketAuth.middleware.js";
import {
  socketConnectionRateLimit,
  socketEventRateLimit,
} from "../middleware/socketRateLimiter.middleware.js";
import registerChatHandlers from "./chat.sockets.js";

// Track connections per user (for connection limits)
const userConnections = new Map();

// Parse CORS origins from environment variable
const getCorsOrigins = () => {
  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
  if (corsOrigin.includes(",")) {
    return corsOrigin.split(",").map((origin) => origin.trim());
  }
  return corsOrigin;
};

export const initSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: getCorsOrigins(),
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Setup Redis adapter for horizontal scaling
  try {
    const pubClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("❌ Redis Adapter: Too many reconnection attempts");
            return new Error("Redis reconnection failed");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Socket.IO Redis Adapter: Connected");
  } catch (error) {
    console.warn(
      "⚠️ Socket.IO Redis Adapter: Failed to connect, using in-memory adapter:",
      error.message
    );
    // Server continues with in-memory adapter (single server mode)
  }

  // Apply rate limiting middleware (connection level)
  io.use(socketConnectionRateLimit);

  // Apply authentication middleware
  io.use(socketAuth);

  // Track and limit connections per user
  io.use((socket, next) => {
    const userId = socket.user?.id;
    if (!userId) {
      return next(new Error("User not authenticated"));
    }

    const currentConnections = userConnections.get(userId) || 0;
    const maxConnections = socket.user?.isAdmin ? 10 : 5; // Admins get more connections

    if (currentConnections >= maxConnections) {
      return next(
        new Error(
          `Too many connections. Maximum ${maxConnections} connections per user.`
        )
      );
    }

    // Increment connection count
    userConnections.set(userId, currentConnections + 1);

    // Decrement on disconnect
    socket.on("disconnect", () => {
      const count = userConnections.get(userId) || 0;
      userConnections.set(userId, Math.max(0, count - 1));
      if (userConnections.get(userId) === 0) {
        userConnections.delete(userId);
      }
    });

    next();
  });

  io.on("connection", (socket) => {
    // Sanitized logging (no sensitive user data in production)
    if (process.env.NODE_ENV === "production") {
      console.log("✅ Socket connected:", socket.id);
    } else {
      console.log("✅ Socket connected:", socket.id, "User ID:", socket.user?.id);
    }

    // Store rate limiter function on socket for use in handlers
    socket.rateLimitCheck = async () => {
      return new Promise((resolve) => {
        socketEventRateLimit(socket, (err) => {
          if (err) {
            socket.emit("chat:error", err.message || "Rate limit exceeded");
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    };

    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      if (process.env.NODE_ENV === "production") {
        console.log("❌ Socket disconnected:", socket.id);
      } else {
        console.log("❌ Socket disconnected:", socket.id, "Reason:", reason);
      }
    });
  });

  return io;
};

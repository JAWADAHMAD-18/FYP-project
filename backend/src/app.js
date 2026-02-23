import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// Routes imports

// import {
//   apiLimiter,
//   chatLimiter,
//   customPackageLimiter,
//   externalApiLimiter,
//   dbQueryLimiter,
//   authLimiter,
//   strictLimiter,
// } from "./utills/rateLimiter.utills.js";
import userRoutes from "./routes/users.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import packageRoutes from "./routes/packages.routes.js";
import customPackageRoutes from "./routes/customPackage.routes.js";
import chatBotRoutes from "./routes/chatBot.routes.js";
import realtimeChatRoutes from "./routes/realtimeChat.routes.js";
import userBookingRoutes from "./routes/userBooking.routes.js";
import adminBookingRoutes from "./routes/adminBooking.routes.js";
import adminDashboardRoutes from "./routes/adminDashboard.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";

//for production that proxy
// app.set("trust proxy", 1);
// Route mounting
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", packageRoutes); // Public package routes
app.use("/api/v1", customPackageRoutes); // Custom package routes
app.use("/api/v1/chat", chatBotRoutes); // Chatbot endpoint
app.use("/api/v1/realtime-chat", realtimeChatRoutes); // Realtime chat routes
app.use("/api/v1/user/booking", userBookingRoutes); // User booking routes
app.use("/api/v1/admin/booking", adminBookingRoutes); // Admin booking routes
app.use("/api/v1/admin/dashboard", adminDashboardRoutes); // Admin dashboard routes
app.use("/api/v1/favorites", favoriteRoutes); // Favorite routes

export default app;

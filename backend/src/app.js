import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// Routes imports
import userRoutes from "./routes/users.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import packageRoutes from "./routes/packages.routes.js";
import customPackageRoutes from "./routes/customPackage.routes.js";

// Route mounting
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", packageRoutes); // Public package routes
app.use("/api/v1", customPackageRoutes); // Custom package routes

export default app;

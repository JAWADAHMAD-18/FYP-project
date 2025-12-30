import { Server } from "socket.io";
import { socketAuth } from "../middleware/socketAuth.middleware.js";
import registerChatHandlers from "./chat.sockets.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // TODO: restrict in production
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);
    console.log("User:", socket.user);

    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

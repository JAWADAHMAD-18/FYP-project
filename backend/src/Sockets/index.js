import { Server } from "socket.io";
import { socketAuth } from "../middlewares/socketAuth.middleware.js";
import registerChatHandlers from "./chat.socket.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",//TODO: chnage this in production only from frontend domain
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuth);
  console.log("✅ Socket connected:", socket.id);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user);

    registerChatHandlers(io, socket);
  });

  return io;
};

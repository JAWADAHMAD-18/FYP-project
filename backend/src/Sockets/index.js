import { Server } from "socket.io";
import { socketAuth } from "../middlewares/socketAuth.middleware.js";
import registerChatHandlers from "./chat.socket.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",//TODO: chnage this in production only from frontend domain
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user);

    registerChatHandlers(io, socket);
  });

  return io;
};

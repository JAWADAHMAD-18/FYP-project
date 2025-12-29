import express from "express";
import http from "http";
import { Server } from "socket.io";
import { io as clientIO } from "socket.io-client";

// Import your built-in chat handlers
import  registerChatHandlers  from "./Sockets/chat.sockets.js"; // adjust path if needed

// -------------------------
// Express + HTTP server
// -------------------------
const app = express();
app.use(express.json());
const server = http.createServer(app);

// -------------------------
// Socket.IO server
// -------------------------
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // -------------------------
  // MOCK user for testing
  // -------------------------
  socket.user = {
    id: "12345",
    name: "Test User",
    email: "testuser@example.com",
    isAdmin: false,
  };

  // Use your built-in chat handlers
  registerChatHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log("⚠ Client disconnected:", socket.id, reason);
  });
});

// -------------------------
// Start server
// -------------------------
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // -------------------------
  // Node test client
  // -------------------------
  const socket = clientIO(`http://localhost:${PORT}`, {
    transports: ["polling", "websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Node test client connected:", socket.id);

    // Start chat
    socket.emit("chat:start");

    // Listen for server events
    socket.on("chat:ready", (data) => console.log("chat:ready:", data));
    socket.on("chat:message", (data) => console.log("chat:message:", data));
    socket.on("chat:system", (data) => console.log("chat:system:", data));

    // -------------------------
    // Auto send messages every 2 seconds
    // -------------------------
    let messageCount = 0;
    const messages = [
      "Hello admin!",
      "I want to know about packages.",
      "Do you have any discounts?",
      "Thanks for the info!",
      "Goodbye!",
    ];

    const interval = setInterval(() => {
      if (messageCount >= messages.length) {
        clearInterval(interval);
        console.log("✅ Finished sending test messages");
        return;
      }

      const msg = messages[messageCount];
      console.log("📤 Sending message:", msg);
      socket.emit("chat:message", msg);
      messageCount++;
    }, 2000);
  });

  socket.on("connect_error", (err) =>
    console.error("❌ Node client connect error:", err.message)
  );

  socket.on("disconnect", (reason) =>
    console.warn("⚠ Node client disconnected:", reason)
  );
});

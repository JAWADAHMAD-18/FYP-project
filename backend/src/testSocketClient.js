import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_ACCESS_TOKEN_HERE", // use a real JWT token from your system
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server:", socket.id);

  // Test start chat
  socket.emit("chat:start");

  // Listen for chat ready
  socket.on("chat:ready", (conversation) => {
    console.log("Chat ready:", conversation);
  });

  // Listen for messages
  socket.on("chat:message", (message) => {
    console.log("New message:", message);
  });

  // Listen for system messages
  socket.on("chat:system", (msg) => {
    console.log("System message:", msg);
  });
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket connect error:", err.message);
});

// src/server/socketServer.ts
import { Server } from "socket.io";

if (!(global as any).io) {
  console.log("🚀 Initializing global Socket.IO server...");

  const io = new Server({
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const { roomId, participantId } = socket.handshake.auth || {};
    console.log("✅ User connected:", socket.id, { roomId, participantId });

    // Join a room manually if provided
    if (roomId) {
      socket.join(roomId);
      console.log(`👥 ${socket.id} joined room ${roomId}`);
    }

    // Manual joinRoom (fallback)
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`👥 ${socket.id} joined ${room} via joinRoom`);
    });

    // Listen for messages
    socket.on("chat:msg", (message) => {
      console.log("💬 Received chat:msg:", message);

      const { roomId, participantId } = socket.handshake.auth || {};

      if (!roomId) {
        console.error("❌ No roomId found in auth!");
        return;
      }

      const msgObject = {
        text: message,
        sender: {
          senderId: participantId,
          name: "Anonymous",
          isAdmin: false,
        },
        timestamp: Date.now(),
      };

      console.log(`📤 Broadcasting to room ${roomId}`);
      io.to(roomId).emit("chat:msg", msgObject);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });

  io.listen(8000);
  (global as any).io = io;
  console.log("✅ Socket.IO server running on port 8000");
}

export {};

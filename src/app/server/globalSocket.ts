import { Server } from "socket.io";

if (!(global as any).io) {
  console.log("🚀 Initializing global Socket.IO server...");

  const io = new Server({
    cors: {
      origin: "*", // you can restrict later to your frontend origin
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const { roomId, participantId } = socket.handshake.auth || {};
    console.log("✅ User connected:", socket.id, { roomId, participantId });

    // --- Join room if provided ---
    if (roomId) {
      socket.join(roomId);
      console.log(`👥 ${socket.id} joined room ${roomId}`);
    } else {
      console.warn(`⚠️ No roomId provided by ${socket.id}`);
    }

    // --- Optional: Allow joining later ---
    socket.on("joinRoom", (room: string) => {
      socket.join(room);
      console.log(`👥 ${socket.id} joined ${room} via joinRoom`);
    });

    // --- When a message is sent, just broadcast ---
    socket.on("chat:msg", (message) => {
      console.log("💬 Broadcasting chat message:", message);

      if (!roomId) {
        console.error("❌ No roomId in handshake!");
        return;
      }

      // Directly broadcast message to room
      io.to(roomId).emit("chat:msg", message);
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

import { Server, Socket } from "socket.io";

interface ServerToClientEvents {
  "chat:msg": (message: ChatMessage) => void;
}

interface ClientToServerEvents {
  "joinRoom": (room: string) => void;
  "chat:msg": (message: ChatMessage) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  roomId?: string;
  participantId?: string;
}

interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number;
}

declare global {
  // Extend global to store Socket.IO server instance
  // Prevents multiple initializations during hot reloads in Next.js
  var io:
    | Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
    | undefined;
}

// ✅ Prevent multiple instances (important for dev hot reloads)
if (!global.io) {
  console.log("🚀 Initializing global Socket.IO server...");

  const io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > = new Server({
    cors: {
      origin: "*", // you can restrict later to your frontend origin
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    const { roomId, participantId } = socket.handshake.auth as {
      roomId?: string;
      participantId?: string;
    };

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
    socket.on("chat:msg", (message: ChatMessage) => {
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
  global.io = io;

  console.log("✅ Socket.IO server running on port 8000");
}

export {};

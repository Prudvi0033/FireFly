// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (roomId: string, participantId: string): Socket => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      transports: ["websocket"],
      auth: { roomId, participantId },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket?.id);
      console.log("Auth Data:", { roomId, participantId });

      // Explicitly join room after connection (ensures consistency)
      socket?.emit("joinRoom", roomId);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
    });
  }

  return socket;
};

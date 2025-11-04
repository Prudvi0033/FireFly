import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (roomId: string, participantId: string): Socket => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      auth: { roomId, participantId },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
      socket = null;
    });
  }
  return socket;
};

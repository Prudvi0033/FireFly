import { Server as SocketIOServer } from "socket.io";
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { RoomData } from "@/types/types";

const globalForSocket = globalThis as unknown as { io?: SocketIOServer };

export async function GET(_req: NextRequest) {
  if (!globalForSocket.io) {
    console.log("Creating new Socket.IO server...");
    const io = new SocketIOServer({
      cors: {
        origin: "*",
      },
    });

    io.on("connect", async (socket) => {
      console.log(`Client connected: ${socket.id}`);

      const { roomId, participantId } = socket.handshake.auth as {
        roomId: string;
        participantId: string;
      };

      if (!roomId || !participantId) {
        console.warn("Missing roomId or participantId in auth");
        return socket.disconnect(true);
      }

      const roomData = await redis.get(`room:${roomId}`);
      if (!roomData) {
        console.warn(`Room ${roomId} not found or expired`);
        return socket.disconnect(true);
      }

      const room: RoomData = JSON.parse(roomData);
      const participant = room.participants.find(
        (p) => p.userId === participantId
      );

      if (!participant) {
        console.warn(
          `Participant ${participantId} not found in room ${roomId}`
        );
        return socket.disconnect(true);
      }

      socket.join(roomId);
      console.log(`${participantId} joined room ${roomId}`);

      socket.on("chat:msg", async (msg: string) => {
        const chatMsg = {
          sender: {
            senderId: participant.userId,
            name: participant.name,
            isAdmin: participant.isAdmin
          },
          text: msg,
          timestamp: Date.now(),
        };

        await redis.rPush(`room:${roomId}:msg`, JSON.stringify(chatMsg))
        io.to(`${roomId}`).emit("chat:msg", msg)
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    io.listen(8000);
    globalForSocket.io = io;
  }

  return NextResponse.json({
    status: true,
    message: "Socket.IO server active",
  });
}

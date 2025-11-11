import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { Message, RoomData } from "@/types/types";

// GET /api/room/:id/message
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.indexOf("room") + 1]; 

    if (!id) {
      return NextResponse.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    // Fetch messages from Redis
    const messages = await redis.lRange(`room:${id}:msg`, 0, -1);

    if (!messages || messages.length === 0) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const parsedMessages: Message[] = messages.map((m) => JSON.parse(m));

    return NextResponse.json({ messages: parsedMessages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { participantId, roomId, text } = await req.json();

    if (!participantId || !roomId || !text) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const roomData = await redis.get(`room:${roomId}`);
    if (!roomData) {
      return NextResponse.json(
        { message: "Room not found or expired" },
        { status: 404 }
      );
    }

    const room: RoomData = JSON.parse(roomData);

    const participant = room.participants.find(
      (p) => p.userId === participantId
    );

    if (!participant) {
      return NextResponse.json(
        { message: "Participant not found in room" },
        { status: 404 }
      );
    }

    const messageObject: Message = {
      sender: {
        senderId: participantId,
        name: participant.name,
        isAdmin: participant.isAdmin,
      },
      text,
      timestamp: Date.now(),
    };

    await redis.rPush(`room:${roomId}:msg`, JSON.stringify(messageObject));

    return NextResponse.json({ message: messageObject }, { status: 200 });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

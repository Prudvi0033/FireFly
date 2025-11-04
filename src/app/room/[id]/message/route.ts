import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/types";

// GET /api/room/:id/message
export async function GET(
  _req: NextRequest,
   context : { params: Promise<{id : string}> }
) {
  try {
    const { id } = await context.params;
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

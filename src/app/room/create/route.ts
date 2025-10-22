import redis from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export interface Participant {
  userId: string;
  name: string;
  isAdmin: boolean;
}

export interface RoomData {
  roomId: string;
  creatorName: string;
  createdAt: number;
  participants: Participant[];
  messages: [];
  isActive: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { creatorName, isAdmin } = await req.json();

    if (!creatorName || !creatorName.trim()) {
      return NextResponse.json(
        { message: "Creator name is required" },
        { status: 400 }
      );
    }

    const roomId = nanoid(10);
    const creatorUserId = nanoid(10);

    const creator: Participant = {
      userId: creatorUserId,
      name: creatorName.trim(),
      isAdmin: true,
    };

    const roomData: RoomData = {
      roomId,
      creatorName: creatorName.trim(),
      createdAt: Date.now(),
      participants: [creator],
      messages: [],
      isActive: true,
    };

    // Store in Redis with 24-hour expiration
    await redis.setEx(
      `room:${roomId}`,
      86400, // 24 hours in seconds
      JSON.stringify(roomData)
    );

    // Also store room ID in a set of active rooms
    await redis.sAdd("active_rooms", roomId);

    const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/join/${roomId}`;

    return NextResponse.json({
      roomId,
      creatorUserId,
      shareableLink,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { message: "Failed to create room" },
      { status: 500 }
    );
  }
}
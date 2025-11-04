import { generateToken, Token } from "@/actions/stream.action";
import redis from "@/lib/redis";
import { Participant, RoomData } from "@/types/types";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

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

    // Generate token for creator
    const tokenData: Token = {
      userId: creatorUserId,
      name: creatorName.trim(),
      isAdmin: true,
    };

    const tokenRes = await generateToken(tokenData);

    // Create creator participant with token
    const creator: Participant = {
      userId: creatorUserId,
      name: creatorName.trim(),
      isAdmin: true,
      token: tokenRes.token,
    };

    // Create room data with creator
    const roomData: RoomData = {
      roomId,
      creatorName: creatorName.trim(),
      createdAt: Date.now(),
      isActive: true,
      participants: [creator],
    };

    // Store in Redis with 24-hour expiration
    await redis.setEx(
      `room:${roomId}`,
      3600, // 1 hour in seconds
      JSON.stringify(roomData)
    );

    // Also store room ID in a set of active rooms
    await redis.sAdd("active_rooms", roomId);
    
    const shareableLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/space/${roomId}`;

    return NextResponse.json({
      roomId,
      creatorUserId,
      token: tokenRes.token,
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

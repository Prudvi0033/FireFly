import redis from "@/lib/redis";
import { RoomData } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params first
    const { id } = await context.params;

    if (!id || id.trim() === "") {
      return NextResponse.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    const roomDataRaw = await redis.get(`room:${id}`);

    if (!roomDataRaw) {
      return NextResponse.json(
        { message: "Room not found or expired" },
        { status: 404 }
      );
    }

    const roomData: RoomData = JSON.parse(roomDataRaw);

    if (!roomData.isActive) {
      return NextResponse.json(
        { message: "Room is no longer active" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      roomId: roomData.roomId,
      creatorName: roomData.creatorName,
      createdAt: roomData.createdAt,
      isActive: roomData.isActive,
      participants: roomData.participants,
      participantCount: roomData.participants.length,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { message: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

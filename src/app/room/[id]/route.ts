import redis from "@/lib/redis";
import { NextResponse } from "next/server";
import { RoomData } from "../create/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id || id.trim() === "") {
      return NextResponse.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    // Fetch room data from Redis
    const roomDataRaw = await redis.get(`room:${id}`);

    if (!roomDataRaw) {
      return NextResponse.json(
        { message: "Room not found or expired" },
        { status: 404 }
      );
    }

    const roomData: RoomData = JSON.parse(roomDataRaw);

    // Check if room is active
    if (!roomData.isActive) {
      return NextResponse.json(
        { message: "Room is no longer active" },
        { status: 410 }
      );
    }

    // Return room data with participants
    return NextResponse.json({
      roomId: roomData.roomId,
      creatorName: roomData.creatorName,
      createdAt: roomData.createdAt,
      isActive: roomData.isActive,
      participants: roomData.participants, // All participants with admin status
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

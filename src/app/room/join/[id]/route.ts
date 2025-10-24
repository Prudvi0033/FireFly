import { generateToken, Token } from "@/actions/stream.action";
import redis from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { Participant, RoomData } from "../../create/route";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name } = body;
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Name of the participant is required" },
        { status: 400 }
      );
    }

    // Fetch room from Redis
    const roomData = await redis.get(`room:${id}`);
    if (!roomData) {
      return NextResponse.json(
        { message: "Room is expired or not found" },
        { status: 404 }
      );
    }

    const room: RoomData = JSON.parse(roomData);

    // Check if room is still active
    if (!room.isActive) {
      return NextResponse.json(
        { message: "Room is no longer active" },
        { status: 410 }
      );
    }

    // Generate userId for new participant
    const userId = nanoid(10);

    // Generate token for new participant
    const tokenData: Token = {
      userId,
      name: name.trim(),
      isAdmin: false,
    };

    const tokenRes = await generateToken(tokenData);

    // Create new participant with token
    const newParticipant: Participant = {
      userId,
      name: name.trim(),
      isAdmin: false,
      token: tokenRes.token,
    };

    // Add participant to room
    room.participants.push(newParticipant);

    // Update room in Redis
    await redis.setEx(
      `room:${id}`,
      86400, // 24 hours expiration
      JSON.stringify(room)
    );

    return NextResponse.json(
      {
        success: true,
        userId,
        token: tokenRes.token,
        user: {
          id: userId,
          name: name.trim(),
          isAdmin: false,
        },
        message: "Successfully joined room",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { message: "Failed to join room" },
      { status: 500 }
    );
  }
}
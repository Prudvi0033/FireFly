import redis from "@/lib/redis";
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
        { message: "Name of the participant is requied" },
        { status: 400 }
      );
    }

    const data = await redis.get(`room:${id}`);
    if (!data) {
      return NextResponse.json(
        { message: "Room is expired or not found" },
        { status: 400 }
      );
    }

    const room: RoomData = await JSON.parse(data);

    const newParticipant: Participant = {
      userId: `participant_${Date.now()}_${Math.random()
        .toString(32)
        .substring(2, 9)}`,
      name: name.trim(),
      isAdmin: false,
    };

    room.participants.push(newParticipant);

    await redis.set(`room:${id}`, JSON.stringify(room));

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined room",
        participant: newParticipant,
        room: room,
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

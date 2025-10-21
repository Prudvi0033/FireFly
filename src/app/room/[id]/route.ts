import redis from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET( request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Room ID is required" }, { status: 400 });
    }

    const data = await redis.get(`room:${id}`);

    if (!data) {
      return NextResponse.json(
        { message: "Room not found or expired" },
        { status: 404 }
      );
    }

    const room = JSON.parse(data);
    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { message: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

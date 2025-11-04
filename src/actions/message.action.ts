"use server";

import redis from "@/lib/redis";

export const getMessages = async ({ parmas }: { parmas: { id: string } }) => {
  try {
    const { id } = parmas;
    if (!id) {
      return Response.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    const messages = await redis.lRange(`room:${id}:msg`, 0, -1)
    if (!messages || messages.length === 0) {
      return Response.json([], { status: 200 });
    }

    const parsedMessages = messages.map((m) => JSON.parse(m))
    return {parsedMessages, status: 200}
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

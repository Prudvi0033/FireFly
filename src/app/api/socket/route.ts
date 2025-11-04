// src/app/api/socket/route.ts
import "@/app/server/globalSocket";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: true, message: "Socket.IO server active" });
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: true,
    message: "Socket.IO server hosted externally at https://fireflysocket.onrender.com",
  });
}

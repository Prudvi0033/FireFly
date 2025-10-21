"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Copy } from "lucide-react";

interface Participant {
  userId: string;
  name: string;
  isAdmin: boolean;
}

interface RoomData {
  roomId: string;
  creatorName: string;
  createdAt: number;
  participants: Participant[];
  isActive: boolean;
}

const JoinRoomPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axiosInstance.get(`/room/${id}`);
        setRoom(res.data);
      } catch (error) {
        console.error("Failed to fetch room:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRoom();
  }, [id]);

  const handleJoinRoom = async () => {
    if (!name.trim()) return;
    setJoining(true);
    try {
      const res = await axiosInstance.post(`/room/${id}/join`, {
        name: name.trim(),
      });
      console.log("Joined room:", res.data);
      // You can redirect to video/chat UI here if needed
    } catch (error) {
      console.error("Error joining room:", error);
    } finally {
      setJoining(false);
    }
  };

  const handleCopyLink = () => {
    if (!room) return;
    const link = `${window.location.origin}/join/${room.roomId}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 1500);
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading room...
      </div>
    );

  if (!room)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        Room not found or expired.
      </div>
    );

  return (
    <div className="min-h-screen relative flex justify-center items-start bg-neutral-100 py-10">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-1">
          Room ID: <span className="text-emerald-600">{room.roomId}</span>
        </h2>
        <p className="text-gray-600 text-sm">
          Created by <span className="font-semibold">{room.creatorName}</span>
        </p>

        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg w-full"
        >
          {copying ? "Copied!" : "Share Room Link"}
          <Copy size={16} />
        </button>

        <div>
          <h3 className="font-medium mb-2">Current Participants:</h3>
          {room.participants.length === 0 ? (
            <p className="text-gray-500 text-sm">No participants yet.</p>
          ) : (
            <ul className="list-disc list-inside text-gray-700 text-sm">
              {room.participants.map((p) => (
                <li key={p.userId}>
                  {p.name} {p.isAdmin && <span className="text-emerald-600">(Admin)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Input
            placeholder="Enter your name to join"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={handleJoinRoom}
            disabled={joining || !name.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg"
          >
            {joining ? <Loader2 className="animate-spin mx-auto" /> : "Join Room"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default JoinRoomPage;

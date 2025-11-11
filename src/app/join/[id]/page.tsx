"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Copy } from "lucide-react";
import { Montserrat } from "next/font/google";
import { FaUserGroup } from "react-icons/fa6";
import { RoomData } from "@/types/types";

const monte = Montserrat({ subsets: ["latin"] });

interface Participant {
  userId: string;
  name: string;
  isAdmin: boolean;
  token: string;
}

// Loading Skeleton Component
const RoomSkeleton = () => (
  <div
    className={`min-h-screen relative flex justify-center items-center bg-white py-10 ${monte.className}`}
  >
    <Card className="w-full max-w-md p-6 bg-white border shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] border-gray-200">
      {/* Room ID Skeleton */}
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded-lg w-2/3 mb-2 animate-pulse"></div>
      </div>

      {/* Creator Info Skeleton */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>

      {/* Share Button Skeleton */}
      <div className="h-9 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>

      {/* Participants Section */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-3 bg-gray-200 rounded w-3/5 animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="space-y-2">
        <div className="h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </Card>
  </div>
);

const JoinRoomPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  
  // Prevent duplicate join requests
  const joinAttemptRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axiosInstance.get(`/room/${id}`);
        if (mountedRef.current) {
          setRoom(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch room:", error);
        if (mountedRef.current) {
          setError("Room not found or expired");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };
    
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const handleJoinRoom = async () => {
    // Prevent duplicate calls
    if (joinAttemptRef.current || joining) {
      console.log("Join already in progress, ignoring duplicate call");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    // Check if user already joined this room
    const existingUserId = localStorage.getItem(`room_${id}_userId`);
    if (existingUserId) {
      // User already joined, just redirect
      router.push(`/space/${id}`);
      return;
    }

    joinAttemptRef.current = true;
    setJoining(true);
    setError(null);

    try {
      // Call the join endpoint to add participant to room and get token
      const res = await axiosInstance.post(`/room/join/${id}`, {
        name: name.trim(),
      });

      if (!mountedRef.current) return;

      if (res.data?.userId && res.data?.token) {
        // Store the userId AND token in localStorage
        localStorage.setItem(`room_${id}_userId`, res.data.userId);
        localStorage.setItem(`room_${id}_token`, res.data.token);
        localStorage.setItem(`room_${id}_name`, name.trim());
        localStorage.setItem(`room_${id}_isAdmin`, 'false');

        // Longer delay to ensure Redis write is complete
        await new Promise(resolve => setTimeout(resolve, 300));

        // Redirect to space page with state
        router.push(`/space/${id}?joined=true`);
      } else {
        setError("Failed to join room. Please try again.");
        joinAttemptRef.current = false;
      }
    } catch (error) {
      console.error("Error joining room:", error);
      if (mountedRef.current) {
        setError("Failed to join room");
        joinAttemptRef.current = false;
      }
    } finally {
      if (mountedRef.current) {
        setJoining(false);
      }
    }
  };

  const handleCopyLink = () => {
    if (!room) return;
    const link = `${window.location.origin}/join/${room.roomId}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 1500);
  };

  if (loading) return <RoomSkeleton />;

  if (!room)
    return (
      <div
        className={`min-h-screen relative flex justify-center items-center bg-white ${monte.className}`}
      >
        <Card className="w-full max-w-sm p-6 bg-white border border-red-200 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] text-center">
          <p className="text-red-600 text-base font-medium">
            {error || "Room not found or expired."}
          </p>
        </Card>
      </div>
    );

  return (
    <div
      className={`min-h-screen relative flex justify-center items-center bg-white py-10 px-4 ${monte.className}`}
    >
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] ">
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
              Room ID
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              <span className="text-emerald-600">{room.roomId}</span>
            </h2>
          </div>

          {/* Creator Info */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm">
              Created by{" "}
              <span className="font-semibold text-gray-900">
                {room.creatorName}
              </span>
            </p>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg w-full mb-5 font-medium transition-colors duration-200 text-sm"
          >
            {copying ? "Copied!" : "Share Room Link"}
            <Copy size={14} />
          </button>

          {/* Participants Section */}
          <div className="mb-6">
            <div className="flex items-center ml-1 gap-2 mb-2">
              <FaUserGroup className="opacity-80 text-emerald-600" />
              <h3 className="font-semibold text-gray-900 text-sm">
                Participants ({room.participants.length})
              </h3>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              {room.participants.length === 0 ? (
                <p className="text-gray-500 text-xs">No participants yet.</p>
              ) : (
                <ul className="space-y-1">
                  {room.participants.map((p: Participant) => (
                    <li
                      key={p.userId}
                      className={`flex items-center justify-between px-2 py-0.5 rounded-sm w-fit text-xs border
        ${
          p.isAdmin
            ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-medium"
            : "bg-gray-100 border-gray-300 text-gray-700"
        }`}
                    >
                      <span>{p.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Join Section */}
          <div className="space-y-2">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !joining && handleJoinRoom()
                }
                disabled={joining}
                className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/30 text-sm disabled:bg-gray-100"
              />
            </div>
            <button
              onClick={handleJoinRoom}
              disabled={joining || !name.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Joining...
                </>
              ) : (
                "Join Room"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomPage;
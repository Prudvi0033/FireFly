import Image from "next/image";
import React from "react";

interface Message {
  id: number;
  name: string;
  message: string;
  time: string;
  profile: string;
}

const messages: Message[] = [
  {
    id: 1,
    name: "Ram",
    message: "What are you guy's doing these days?",
    time: "12min ago",
    profile: "/profile1.webp",
  },
];

const MessageBox = () => {
  return (
    <div className="space-y-2 w-full">
      {/* Loading Skeleton 1 */}
      <div className="bg-gradient-to-br scale-90 border border-neutral-200 from-gray-50 to-gray-100 rounded-lg shadow-[0_2px_6px_rgba(107,114,128,0.08)] p-3">
        <div className="flex gap-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex-shrink-0 animate-pulse"></div>
          <div className="flex-1 space-y-1">
            <div className="h-2 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            <div className="h-1.5 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            <div className="h-1.5 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Message */}
      {messages.map((msg) => (
        <div
          className="bg-emerald-500 scale-105 shadow-[-2px_4px_12px_rgba(0,0,0,0.2),2px_6px_12px_rgba(0,0,0,0.03)] border-2 border-gray-100 rounded-lg relative overflow-hidden"
          key={msg.id}
        >
          {/* Overlay accent */}
          
          <div className="flex gap-x-2 p-3 relative z-10">
            <div
              className="h-9 w-9 border-2 border-emerald-200 rounded-full flex-shrink-0 bg-gradient-to-r from-emerald-300 to-emerald-400 animate-pulse"
            ></div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-x-2">
                <div className="h-2 w-16 bg-gradient-to-r from-emerald-300 to-emerald-400 rounded animate-pulse"></div>
                <div className="h-1.5 w-12 bg-gradient-to-r from-emerald-300 to-emerald-400 rounded animate-pulse whitespace-nowrap"></div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-emerald-300 to-emerald-400 rounded animate-pulse"></div>
                <div className="h-2 w-32 bg-gradient-to-r from-emerald-300 to-emerald-400 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Loading Skeleton 2 */}
      <div className="bg-gradient-to-br scale-90 border border-neutral-200 from-gray-50 to-gray-100 rounded-lg shadow-[0_2px_6px_rgba(107,114,128,0.08)] p-3">
        <div className="flex gap-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex-shrink-0 animate-pulse"></div>
          <div className="flex-1 space-y-1">
            <div className="h-2 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            <div className="h-1.5 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            <div className="h-1.5 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessagesFlow = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs">
        {/* Messages Component */}
        <div className="mb-4">
          <MessageBox />
        </div>

        {/* Text Overlay */}
        <div className="pt-2 text-center pl-2">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Real-time Communication
          </h1>
          <p className="text-gray-400 font-medium text-[10px]">
            Instant messaging powered by WebSocket connections.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessagesFlow;
import { getSocket } from "@/lib/socket";
import React, { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

interface Message {
  roomId: string;
  participantId: string;
}

const ChatBox = ({ roomId, participantId }: Message) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const socket = getSocket(roomId, participantId);

    socket.on("chat:msg", (msg) => {
      console.log("📨 Received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("system:joined", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat:msg");
      socket.off("system:joined");
    };
  }, [roomId, participantId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const socket = getSocket(roomId, participantId);
    socket.emit("chat:msg", inputValue.trim());
    setMessages((prev) => [...prev, `You: ${inputValue}`]);
    setInputValue("");
  };

  return (
    <div className="fixed bottom-6 border-4 right-6 w-[26rem] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-lg text-gray-900">Group Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400">
            <MessageCircle size={42} className="mx-auto mb-2" />
            <p>Start a conversation</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="bg-gray-50 p-2 rounded-lg text-sm text-gray-700">
              {msg}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 focus:ring focus:ring-emerald-300 outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;

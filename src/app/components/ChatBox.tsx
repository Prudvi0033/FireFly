"use client";
import { getSocket } from "@/lib/socket";
import React, { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Message } from "@/types/types";

interface InputMessage {
  roomId: string;
  participantId: string;
}

const ChatBox = ({ roomId, participantId }: InputMessage) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = getSocket(roomId, participantId);

    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/room/${roomId}/message`);
        setMessages(res.data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    getMessages();

    // 👇 Listen for new real-time messages
    const onNewMessage = (msg: Message) => {
      console.log("📨 Received:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat:msg", onNewMessage);

    // Cleanup
    return () => {
      socket.off("chat:msg", onNewMessage);
    };
  }, [roomId, participantId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      // ✅ 1. Save to Redis (persistent)
      const res = await axiosInstance.post(`/room/${roomId}/message`, {
        roomId,
        participantId,
        text: inputValue.trim(),
      });

      if (res.status === 200 && res.data.message) {
        // ✅ 2. Broadcast real-time via socket using the message from backend
        const socket = getSocket(roomId, participantId);
        
        // Use the complete message object returned from the backend
        socket.emit("chat:msg", res.data.message);
        setInputValue("");
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  return (
    <div className="fixed bottom-4 right-6 w-[26rem] h-[94%] bg-white border rounded-2xl shadow-lg flex flex-col overflow-y-auto">
      <div className="p-4 border-b bg-gray-50 overflow-y-auto">
        <h3 className="font-semibold text-lg text-gray-900">Group Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center h-full flex items-center justify-center text-gray-400">
            <MessageCircle size={42} className="mx-auto mb-2" />
            <p>Start a conversation</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = msg.sender.senderId === participantId;
            return (
              <div
                key={idx}
                className={`flex flex-col ${
                  isOwnMessage ? "items-end" : "items-start"
                }`}
              >
                <span className="text-xs text-gray-500 mb-1">
                  {msg.sender.name}
                  {msg.sender.isAdmin && (
                    <span className="text-emerald-500 font-semibold">
                      {" "}(Admin)
                    </span>
                  )}
                </span>
                <div
                  className={`p-2 rounded-lg text-sm max-w-[80%] ${
                    isOwnMessage
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && handleSendMessage()
          }
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
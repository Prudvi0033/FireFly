"use client";
import { axiosInstance } from "@/lib/axios";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  useCallStateHooks,
  useCall,
  ParticipantView,
  Call,
} from "@stream-io/video-react-sdk";
import {
  FiShare2,
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhone,
  FiX,
} from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Poppins } from "next/font/google";
import io, { Socket } from "socket.io-client";
import ChatBox from "@/app/components/ChatBox";
import LoadingScreen from "@/app/components/LoadingScreen";
import { deleteActiveroom, deleteMessagesRoom } from "@/actions/delete.action";
import { Trash, UsersRound } from "lucide-react";
import { removeParticipant } from "@/actions/participant.action";
const monte = Poppins({ subsets: ["latin"], weight: ["300"] });

const apiKey = "k9eqzaujw5rd";

interface Participant {
  userId: string;
  name: string;
  isAdmin: boolean;
  token: string;
}

interface RoomData {
  roomId: string;
  creatorName: string;
  createdAt: number;
  participants: Participant[];
  isActive: boolean;
}

const Page: React.FC = () => {
  const params = useParams();
  const roomId = (params?.id || params?.roomId) as string;
  const router = useRouter();

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [meetEnded, setMeetEnded] = useState<boolean>(false);
  const [participantsBar, setParticipantsBar] = useState(false);

  // --- SOCKET SETUP ---
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!currentUser?.userId || !roomId) return;

    // Disconnect existing socket if any (in case of re-init)
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket: Socket = io(`${process.env.SOCKET_URL}`, {
      auth: {
        roomId,
        participantId: currentUser.userId,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      console.log("Auth data sent:", {
        roomId,
        participantId: currentUser.userId,
      });
    });

    socket.on("disconnect", (reason: string) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err: Error) => {
      console.log("⚠️ Socket connection error:", err.message);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser, roomId]);

  const fetchRoomData = async (): Promise<RoomData | null> => {
    try {
      const res = await axiosInstance.get<RoomData>(`/room/${roomId}`);
      setRoomData(res.data);
      return res.data;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      return null;
    }
  };

  const setupUser = async (participant: Participant): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setCurrentUser(participant);

      const streamClient = new StreamVideoClient({
        apiKey,
        user: {
          id: participant.userId,
          name: participant.name,
        },
        token: participant.token,
      });
      setClient(streamClient);

      const callInstance: Call = streamClient.call("default", String(roomId));

      // Disable camera and microphone BEFORE joining
      await callInstance.camera.disable();
      await callInstance.microphone.disable();

      // Join the call
      await callInstance.join({ create: true });

      setCall(callInstance);
      setLoading(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initSocket = async (): Promise<void> => {
      await fetch("/api/socket");
    };
    initSocket();

    const initializeSpace = async (): Promise<void> => {
      try {
        setLoading(true);

        if (!roomId || Array.isArray(roomId)) {
          setError("Invalid room ID");
          setLoading(false);
          return;
        }

        const room = await fetchRoomData();

        if (!room) {
          setLoading(false);
          return;
        }

        const storedUserId = localStorage.getItem(`room_${roomId}_userId`);

        if (storedUserId) {
          const existingParticipant = room.participants.find(
            (p: Participant) => p.userId === storedUserId
          );

          if (existingParticipant) {
            await setupUser(existingParticipant);
            return;
          } else {
            localStorage.removeItem(`room_${roomId}_userId`);
            setError("Your session has expired. Room no longer active.");
            setLoading(false);
            return;
          }
        }

        setError("User not found in room. Please use the share link to join.");
        setLoading(false);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(errMsg);
        setLoading(false);
      }
    };

    if (roomId && !Array.isArray(roomId)) {
      initializeSpace();
    }
  }, [roomId]);

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_API_URL}/join/${roomId}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveCall = async (): Promise<void> => {
    try {
      if (call) {
        await call.leave();
      }
      localStorage.removeItem(`room_${roomId}_userId`);
      setMeetEnded(true);

      if (currentUser?.isAdmin) {
        try {
          await deleteActiveroom(roomId);
          await deleteMessagesRoom(roomId);
        } catch (error) {
          console.log("Error in deleting room & msg tables", error);
        }
      } else {
        console.log("Participant left room it is still active");
      }
    } catch (err) {
      console.error("Error leaving call:", err);
    }
  };

  if (meetEnded) {
    return <MeetEndedScreen onHomeClick={() => router.push("/")} />;
  }

  if (loading) {
    return <LoadingScreen error={error} />;
  }

  if (error) {
    return <ErrorScreen error={error} onHome={() => router.push("/")} />;
  }

  if (client && call && currentUser && roomData) {
    return (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <VideoCallRoom
            roomData={roomData}
            currentUser={currentUser}
            roomId={roomId}
            onLeave={handleLeaveCall}
            onShare={handleCopyLink}
          />
        </StreamCall>
      </StreamVideo>
    );
  }

  return null;
};

interface ErrorScreenProps {
  error: string;
  onHome: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onHome }) => {
  return (
    <div
      className={`min-h-screen ${monte.className} w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-50 to-gray-50 relative overflow-hidden p-4`}
    >
      {/* Rocket falling animation */}
      <div
        className="relative mb-8 animate-bounce"
        style={{ animationDuration: "2s" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120px"
          height="120px"
          viewBox="0 0 18 18"
          className="drop-shadow-2xl transform rotate-180"
        >
          <path
            d="M15 2.5C15.552 2.5 16 2.052 16 1.5C16 0.948 15.552 0.5 15 0.5C14.448 0.5 14 0.948 14 1.5C14 2.052 14.448 2.5 15 2.5Z"
            fill="rgba(16, 185, 129, 1)"
          ></path>
          <path
            d="M3.86902 1.894L2.92202 1.579L2.60701 0.632004C2.50401 0.326004 1.99802 0.326004 1.89502 0.632004L1.58002 1.579L0.633011 1.894C0.480011 1.945 0.377014 2.088 0.377014 2.25C0.377014 2.412 0.481011 2.555 0.633011 2.606L1.58002 2.921L1.89502 3.868C1.94602 4.021 2.08903 4.124 2.25103 4.124C2.41303 4.124 2.55601 4.02 2.60701 3.868L2.92202 2.921L3.86902 2.606C4.02202 2.555 4.12502 2.412 4.12502 2.25C4.12502 2.088 4.02102 1.945 3.86902 1.894Z"
            fill="rgba(52, 211, 153, 1)"
          ></path>
          <path
            d="M12.7621 8.58512L11.7282 6.76359C11.0525 5.85816 6.48208 6.58629 6.25284 7.67221L6.01717 9.67778C4.98801 9.69517 4.06511 9.62629 3.32668 9.46811C2.85674 9.36745 2.41799 9.22169 2.06778 9.00804C1.72108 8.79652 1.36838 8.45766 1.28173 7.95037C1.16915 7.29113 1.56556 6.75626 1.94 6.40795C2.34149 6.03447 2.90611 5.69267 3.55565 5.38728C4.86465 4.77182 6.68219 4.22874 8.70277 3.8837C10.7233 3.53867 12.6181 3.44774 14.0573 3.59383C14.7714 3.66633 15.4175 3.80134 15.9202 4.02035C16.3891 4.22463 16.9407 4.59773 17.0533 5.257C17.1448 5.79378 16.8938 6.2501 16.6151 6.57154C16.3306 6.89964 15.9303 7.19365 15.4789 7.45521C14.7685 7.86677 13.8345 8.25292 12.7621 8.58512Z"
            fill="rgba(110, 231, 183, 0.4)"
          ></path>
          <path
            d="M7.25188 6.88551C6.70546 7.10324 6.31574 7.37425 6.25284 7.67221L6.01717 9.67778L5.25513 16.1625C5.23014 16.3752 5.29726 16.5884 5.43958 16.7484C5.5819 16.9084 5.78585 17 6 17H16.25C16.517 17 16.7638 16.8581 16.8981 16.6274C17.0325 16.3967 17.034 16.112 16.9023 15.8798L11.7281 6.76344C11.5284 6.49602 10.9888 6.37115 10.3217 6.35594L7.25188 6.88551Z"
            fill="rgba(167, 243, 208, 0.3)"
          ></path>
          <path
            d="M5.23926 4.7279C6.26597 4.38997 7.44501 4.09847 8.70273 3.8837C9.72264 3.70954 10.7105 3.60012 11.6239 3.55325C11.0434 2.49356 9.91812 1.775 8.62501 1.775C6.89542 1.775 5.46574 3.06039 5.23926 4.7279Z"
            fill="rgba(16, 185, 129, 1)"
          ></path>
          <path
            d="M9.16588 8.30735C10.6934 8.07105 11.8646 7.43653 11.7802 6.89102C11.6958 6.34551 10.3876 6.09456 8.86012 6.33086C7.33261 6.56716 6.16139 7.20168 6.24578 7.74719C6.33016 8.2927 7.63837 8.54365 9.16588 8.30735Z"
            fill="rgba(16, 185, 129, 1)"
          ></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Seems like, we have a problem!
        </h2>
        <p className="text-emerald-600 font-semibold mb-3 text-lg">
          Launch Failed
        </p>
        <p className="text-gray-600 text-sm mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
          {error}
        </p>
        <button
          onClick={onHome}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
        >
          Return to Launch Pad
        </button>
      </div>
    </div>
  );
};

interface MeetEndedScreenProps {
  onHomeClick: () => void;
}

const MeetEndedScreen: React.FC<MeetEndedScreenProps> = ({ onHomeClick }) => {
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const handleExit = (): void => {
    setIsExiting(true);
    setTimeout(() => onHomeClick(), 500);
  };

  return (
    <div
      className={`min-h-screen ${monte.className} w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden p-4`}
    >
      {/* Rocket launching animation */}
      <div
        className={`relative mb-8 transition-all duration-1000 ${
          isExiting ? "translate-y-[-100vh] opacity-0" : "animate-float"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="140px"
          height="140px"
          viewBox="0 0 18 18"
          className="drop-shadow-2xl"
        >
          <path
            d="M15 2.5C15.552 2.5 16 2.052 16 1.5C16 0.948 15.552 0.5 15 0.5C14.448 0.5 14 0.948 14 1.5C14 2.052 14.448 2.5 15 2.5Z"
            fill="rgba(16, 185, 129, 1)"
          ></path>
          <path
            d="M3.86902 1.894L2.92202 1.579L2.60701 0.632004C2.50401 0.326004 1.99802 0.326004 1.89502 0.632004L1.58002 1.579L0.633011 1.894C0.480011 1.945 0.377014 2.088 0.377014 2.25C0.377014 2.412 0.481011 2.555 0.633011 2.606L1.58002 2.921L1.89502 3.868C1.94602 4.021 2.08903 4.124 2.25103 4.124C2.41303 4.124 2.55601 4.02 2.60701 3.868L2.92202 2.921L3.86902 2.606C4.02202 2.555 4.12502 2.412 4.12502 2.25C4.12502 2.088 4.02102 1.945 3.86902 1.894Z"
            fill="rgba(52, 211, 153, 1)"
          ></path>
          <path
            d="M12.7621 8.58512L11.7282 6.76359C11.0525 5.85816 6.48208 6.58629 6.25284 7.67221L6.01717 9.67778C4.98801 9.69517 4.06511 9.62629 3.32668 9.46811C2.85674 9.36745 2.41799 9.22169 2.06778 9.00804C1.72108 8.79652 1.36838 8.45766 1.28173 7.95037C1.16915 7.29113 1.56556 6.75626 1.94 6.40795C2.34149 6.03447 2.90611 5.69267 3.55565 5.38728C4.86465 4.77182 6.68219 4.22874 8.70277 3.8837C10.7233 3.53867 12.6181 3.44774 14.0573 3.59383C14.7714 3.66633 15.4175 3.80134 15.9202 4.02035C16.3891 4.22463 16.9407 4.59773 17.0533 5.257C17.1448 5.79378 16.8938 6.2501 16.6151 6.57154C16.3306 6.89964 15.9303 7.19365 15.4789 7.45521C14.7685 7.86677 13.8345 8.25292 12.7621 8.58512Z"
            fill="rgba(110, 231, 183, 0.4)"
          ></path>
          <path
            d="M7.25188 6.88551C6.70546 7.10324 6.31574 7.37425 6.25284 7.67221L6.01717 9.67778L5.25513 16.1625C5.23014 16.3752 5.29726 16.5884 5.43958 16.7484C5.5819 16.9084 5.78585 17 6 17H16.25C16.517 17 16.7638 16.8581 16.8981 16.6274C17.0325 16.3967 17.034 16.112 16.9023 15.8798L11.7281 6.76344C11.5284 6.49602 10.9888 6.37115 10.3217 6.35594L7.25188 6.88551Z"
            fill="rgba(167, 243, 208, 0.3)"
          ></path>
          <path
            d="M5.23926 4.7279C6.26597 4.38997 7.44501 4.09847 8.70273 3.8837C9.72264 3.70954 10.7105 3.60012 11.6239 3.55325C11.0434 2.49356 9.91812 1.775 8.62501 1.775C6.89542 1.775 5.46574 3.06039 5.23926 4.7279Z"
            fill="rgba(16, 185, 129, 1)"
          ></path>
          <path
            d="M9.16588 8.30735C10.6934 8.07105 11.8646 7.43653 11.7802 6.89102C11.6958 6.34551 10.3876 6.09456 8.86012 6.33086C7.33261 6.56716 6.16139 7.20168 6.24578 7.74719C6.33016 8.2927 7.63837 8.54365 9.16588 8.30735Z"
            fill="rgba(16, 185, 129, 1)"
          ></path>
        </svg>
      </div>

      <div
        className={`relative z-10 max-w-md w-full text-center transition-all duration-500 ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Mission Complete!
        </h2>
        <p className="text-emerald-600 font-semibold text-lg mb-2">
          Successful Landing
        </p>
        <p className="text-gray-600 text-sm mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
          Thanks for joining the journey! Hope you had a great conversation
          aboard.
        </p>
        <button
          onClick={handleExit}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/40 active:scale-95 hover:scale-105"
        >
          Return to Launch Pad
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

interface CustomSpeakerLayoutProps {
  currentUser: Participant;
  roomId: string;
  onLeave: () => void;
  onShare: () => void;
}

const CustomSpeakerLayout: React.FC<CustomSpeakerLayoutProps> = ({
  currentUser,
  roomId,
  onLeave,
  onShare,
}) => {
  const { useMicrophoneState, useCameraState, useParticipants } =
    useCallStateHooks();
  const call = useCall();
  const { isMute } = useMicrophoneState();
  const { isEnabled } = useCameraState();
  const participants = useParticipants();
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  const localParticipant = participants.find(
    (p) => p.userId === currentUser?.userId
  );

  const otherParticipants = participants.filter(
    (p) => p.userId !== currentUser?.userId
  );
  const visibleOtherParticipants = otherParticipants.slice(0, 2);
  const hiddenParticipantCount = Math.max(0, otherParticipants.length - 2);

  const handleShare = (): void => {
    onShare();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const toggleMic = async (): Promise<void> => {
    try {
      await call?.microphone.toggle();
    } catch (err) {
      console.error("Error toggling microphone:", err);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    console.log("Attempting to remove:", { roomId, participantId }); // debug log
    const res = await removeParticipant(roomId, participantId);
    console.log(res);
  };

  const toggleCamera = async (): Promise<void> => {
    try {
      await call?.camera.toggle();
    } catch (err) {
      console.error("Error toggling camera:", err);
    }
  };

  interface NeomorphButtonProps {
    icon: React.ElementType;
    onClick: () => void;
    isActive?: boolean;
    label?: string;
    danger?: boolean;
  }

  const NeomorphButton: React.FC<NeomorphButtonProps> = ({
    icon: Icon,
    onClick,
    isActive,
    label,
    danger = false,
  }) => (
    <button
      onClick={onClick}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
        isActive
          ? "shadow-[inset_4px_4px_8px_#e0e0e0,inset_-4px_-4px_8px_#ffffff] bg-gray-100"
          : "shadow-[4px_4px_8px_#d0d0d0,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c0c0c0,-6px_-6px_12px_#ffffff] bg-white"
      } active:shadow-[inset_4px_4px_8px_#e0e0e0,inset_-4px_-4px_8px_#ffffff]`}
      title={label}
    >
      <Icon
        className={`w-5 h-5 sm:w-6 sm:h-6 ${
          danger ? "text-red-500" : isActive ? "text-gray-800" : "text-gray-600"
        }`}
      />
    </button>
  );

  return (
    <div className={`flex h-screen bg-gray-100 relative ${monte.className}`}>
      {/* Main Content */}
      <div className="w-7/10 flex flex-col p-4 sm:p-6 gap-4">
        <div className="flex gap-4 items-start flex-1 min-h-0">
          <div
            className={`flex-shrink-0 h-full ${
              otherParticipants.length > 0 ? "w-[50rem]" : "w-full"
            }`}
          >
            <div className="relative w-full h-full">
              {!isEnabled ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl shadow-[8px_8px_24px_#d0d0d0,-8px_-8px_24px_#ffffff] flex items-center justify-center border-4 border-white">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-[inset_4px_4px_8px_#e0e0e0,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
                      <FiVideoOff className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600 font-medium text-base sm:text-lg">
                      {currentUser?.name}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Camera is off
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-3xl shadow-[8px_8px_24px_#d0d0d0,-8px_-8px_24px_#ffffff] overflow-hidden border-4 border-white">
                  {localParticipant && (
                    <ParticipantView participant={localParticipant} />
                  )}
                </div>
              )}
            </div>
          </div>

          {otherParticipants.length > 0 && (
            <div className="flex flex-col gap-4 mt-4 flex-1 overflow-y-auto">
              {visibleOtherParticipants.map((participant) => (
                <div
                  key={participant.sessionId}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div className="w-50 h-38 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border-2 border-emerald-500 shadow-lg hover:shadow-xl transition-all hover:scale-95">
                    <p className="text-white text-4xl font-bold">
                      {participant.name?.charAt(0).toUpperCase() || "?"}
                    </p>
                  </div>
                </div>
              ))}

              {hiddenParticipantCount > 0 && (
                <div
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div className="w-50 h-38 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-2 border-orange-500 shadow-lg">
                    <div className="text-center">
                      <p className="text-white text-3xl font-bold">
                        +{hiddenParticipantCount}
                      </p>
                      <p className="text-xs font-medium text-gray-200 text-center">
                        more
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="flex gap-3 sm:gap-4 items-center bg-white px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-[8px_8px_24px_#e0e0e0,-8px_-8px_24px_#ffffff] border-2 sm:border-4 border-gray-100 flex-wrap justify-center">
            <NeomorphButton
              icon={isMute ? FiMicOff : FiMic}
              onClick={toggleMic}
              isActive={isMute}
              label={isMute ? "Unmute" : "Mute"}
            />

            <NeomorphButton
              icon={!isEnabled ? FiVideoOff : FiVideo}
              onClick={toggleCamera}
              isActive={!isEnabled}
              label={!isEnabled ? "Turn on camera" : "Turn off camera"}
            />

            <NeomorphButton
              icon={FiShare2}
              onClick={handleShare}
              isActive={copiedShare}
              label={copiedShare ? "Copied!" : "Share link"}
            />

            <NeomorphButton
              icon={UsersRound}
              onClick={() => {
                setShowParticipants(!showParticipants);
              }}
              label="View participants"
            />

            <div className="w-px h-6 sm:h-8 bg-gray-200" />

            <NeomorphButton
              icon={FiPhone}
              onClick={onLeave}
              label="Leave call"
            />
          </div>
        </div>
      </div>

      {/* ChatBox Section */}
      <div className="w-3/10 rounded-2xl overflow-hidden">
        <ChatBox roomId={roomId} participantId={currentUser?.userId} />
      </div>

      {showParticipants && (
        <div
          onClick={() => setShowParticipants(!showParticipants)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-96 max-h-96 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Participants ({otherParticipants.length})
              </h2>
              <button
                onClick={() => setShowParticipants(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {otherParticipants.map((participant) => (
                  <div
                    key={participant.sessionId}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-600 via-neutral-400 to-neutral-600 flex items-center justify-center flex-shrink-0">
                      <p className="text-white text-sm font-medium">
                        {participant.name?.charAt(0).toUpperCase() || "?"}
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <p className="text-sm text-gray-900 truncate">
                        {participant.name || "User"}
                      </p>

                      {currentUser.isAdmin && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveParticipant(participant.userId);
                          }}
                          title="remove participant"
                          aria-label="remove participant"
                        >
                          <Trash size={18} className="hover:text-red-700" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface VideoCallRoomProps {
  roomData: RoomData;
  currentUser: Participant;
  roomId: string;
  onLeave: () => void;
  onShare: () => void;
}

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  // roomData,
  currentUser,
  roomId,
  onLeave,
  onShare,
}) => {
  return (
    <CustomSpeakerLayout
      currentUser={currentUser}
      roomId={roomId}
      onLeave={onLeave}
      onShare={onShare}
    />
  );
};

export default Page;

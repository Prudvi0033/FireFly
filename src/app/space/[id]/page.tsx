"use client";
import { axiosInstance } from "@/lib/axios";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  useCallStateHooks,
  useCall,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import {
  FiShare2,
  FiLogOut,
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiUsers,
  FiAlertCircle,
  FiLoader,
  FiPhone,
  FiChevronRight,
  FiCheck,
  FiSend,
  FiX,
} from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import redis from "@/lib/redis";
import { Montserrat } from "next/font/google";
import ChatBox from "@/app/components/ChatBox";
const monte = Montserrat({ subsets: ["latin"] });

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

const Page = () => {
  const params = useParams();
  const roomId = (params?.id || params?.roomId) as string;
  const router = useRouter();

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [meetEnded, setMeetEnded] = useState(false);

  const fetchRoomData = async () => {
    try {
      const res = await axiosInstance.get(`/room/${roomId}`);
      setRoomData(res.data);
      return res.data;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      return null;
    }
  };

  const setupUser = async (participant: Participant) => {
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

      const callInstance = streamClient.call("default", String(roomId));
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
    const initializeSpace = async () => {
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_API_URL}/join/${roomId}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (call) {
        await call.leave();
      }
      localStorage.removeItem(`room_${roomId}_userId`);
      setMeetEnded(true);
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

const LoadingScreen = ({ error }: { error: string | null }) => {
  return (
    <div
      className={`min-h-screen w-full ${monte.className} flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden`}
    >
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-400 animate-spin"></div>
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-emerald-600 border-l-emerald-300 animate-spin animation-delay-1000"
            style={{ animationDirection: "reverse" }}
          ></div>
        </div>
        <div className="text-center">
          <p className="text-gray-900 text-xl font-semibold mb-2">
            Setting up your space...
          </p>
          <p className="text-gray-500 text-sm">Connecting you with Stream</p>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center max-w-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

const ErrorScreen = ({
  error,
  onHome,
}: {
  error: string;
  onHome: () => void;
}) => {
  return (
    <div
      className={`min-h-screen ${monte.className} w-full flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden p-4`}
    >
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-300 flex items-center justify-center animate-pulse">
              <FiAlertCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-red-600 font-semibold mb-2">
            Something went wrong
          </p>
          <p className="text-gray-600 text-sm mb-8">{error}</p>
          <button
            onClick={onHome}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const MeetEndedScreen = ({ onHomeClick }: { onHomeClick: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => onHomeClick(), 500);
  };

  return (
    <div
      className={`min-h-screen ${monte.className} w-full flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden p-4`}
    >
      <div
        className={`relative z-10 max-w-md w-full transition-all duration-500 ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-emerald-50 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiCheck className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Meet Ended</h2>
          <p className="text-gray-600 text-sm mb-2">Thanks for joining!</p>
          <p className="text-gray-500 text-xs mb-8">
            Hope you had a great conversation
          </p>
          <button
            onClick={handleExit}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomSpeakerLayout = ({
  currentUser,
  roomId,
  onLeave,
  onShare,
}: any) => {
  const { useMicrophoneState, useCameraState, useParticipants } =
    useCallStateHooks();
  const call = useCall();
  const { isMute } = useMicrophoneState();
  const { isEnabled } = useCameraState();
  const participants = useParticipants();
  const [copiedShare, setCopiedShare] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Get local participant (you)
  const localParticipant = participants.find(
    (p) => p.userId === currentUser?.userId
  );

  // Get other participants (max 2 visible + counter for rest)
  const otherParticipants = participants.filter(
    (p) => p.userId !== currentUser?.userId
  );
  const visibleOtherParticipants = otherParticipants.slice(0, 2);
  const hiddenParticipantCount = Math.max(0, otherParticipants.length - 2);

  const handleShare = () => {
    onShare();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const toggleMic = async () => {
    try {
      await call?.microphone.toggle();
    } catch (err) {
      console.error("Error toggling microphone:", err);
    }
  };

  const toggleCamera = async () => {
    try {
      await call?.camera.toggle();
    } catch (err) {
      console.error("Error toggling camera:", err);
    }
  };

  const NeomorphButton = ({
    icon: Icon,
    onClick,
    isActive,
    label,
    danger = false,
  }: any) => (
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
      {/* Main Content - 70% width */}
      <div className="w-7/10 flex flex-col p-4 sm:p-6 gap-4">
        {/* Top Section: Main Video (Square) and Participants */}
        <div className="flex gap-4 items-start flex-1 min-h-0">
          {/* Your Big Video - Square */}
          <div className="flex-shrink-0 w-[50rem] h-full">
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

          {/* Other Participants Vertical */}
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

              {/* Counter for hidden participants */}
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

        {/* Control Bar */}
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

            <div className="w-px h-6 sm:h-8 bg-gray-200" />

            <NeomorphButton
              icon={FiPhone}
              onClick={onLeave}
              label="Leave call"
              danger
            />
          </div>
        </div>
      </div>

      {/* ChatBox Section - 30% width */}
      <div className="w-3/10 border-l border-gray-300">
        <ChatBox roomId={roomId} participantId={currentUser?.userId} />
      </div>

      {/* More Participants Modal */}
      {showParticipants && (
        <div
          onClick={() => setShowParticipants(!showParticipants)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-96 max-h-96 flex flex-col">
            {/* Header */}
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

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {otherParticipants.map((participant) => (
                  <div
                    key={participant.sessionId}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <p className="text-white text-sm font-medium">
                        {participant.name?.charAt(0).toUpperCase() || "?"}
                      </p>
                    </div>

                    {/* Name */}
                    <p className="text-sm text-gray-900 truncate">
                      {participant.name || "User"}
                    </p>
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

const VideoCallRoom = ({
  roomData,
  currentUser,
  roomId,
  onLeave,
  onShare,
}: any) => {
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

"use client";
import { axiosInstance } from "@/lib/axios";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
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
} from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import redis from "@/lib/redis";
import { Montserrat } from "next/font/google";
const monte = Montserrat({subsets: ['latin']})

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
      alert("Link copied to clipboard!");
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
    <div className={`min-h-screen w-full ${monte.className} flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden`}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-emerald-600 border-l-emerald-300 animate-spin animation-delay-1000" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <div className="text-center">
          <p className="text-gray-900 text-xl font-semibold mb-2">Setting up your space...</p>
          <p className="text-gray-500 text-sm">Connecting you with Stream</p>
        </div>
        {error && <p className="text-red-500 text-sm mt-2 text-center max-w-sm">{error}</p>}
      </div>
    </div>
  );
};

const ErrorScreen = ({ error, onHome }: { error: string; onHome: () => void }) => {
  return (
  <div className={`min-h-screen ${monte.className} w-full flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden p-4`}>
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-300 flex items-center justify-center animate-pulse">
              <FiAlertCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-red-600 font-semibold mb-2">Something went wrong</p>
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
    <div className={`min-h-screen ${monte.className} w-full flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden p-4`}>
      <div className={`relative z-10 max-w-md w-full transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
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
          <p className="text-gray-500 text-xs mb-8">Hope you had a great conversation</p>
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


const VideoCallRoom = ({ roomData, currentUser, roomId, onLeave, onShare }: any) => {
  const { useMicrophoneState, useCameraState, useParticipants } = useCallStateHooks();
  const call = useCall();
  const { isMute } = useMicrophoneState();
  const { isEnabled } = useCameraState();
  const { participants } = useParticipants();

  const [copiedShare, setCopiedShare] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

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

  const visibleParticipants = participants?.slice(0, 2) || [];
  const hiddenCount = Math.max(0, (participants?.length || 0) - 2);

  const NeomorphButton = ({ icon: Icon, onClick, isActive, label, danger = false }: any) => (
    <button
      onClick={onClick}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
        isActive
          ? "shadow-[inset_4px_4px_8px_#e0e0e0,inset_-4px_-4px_8px_#ffffff] bg-gray-100"
          : "shadow-[4px_4px_8px_#d0d0d0,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c0c0c0,-6px_-6px_12px_#ffffff] bg-white"
      } active:shadow-[inset_4px_4px_8px_#e0e0e0,inset_-4px_-4px_8px_#ffffff]`}
      title={label}
    >
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${danger ? "text-red-500" : isActive ? "text-gray-800" : "text-gray-600"}`} />
    </button>
  );

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex-col relative ${monte.className}`}>
      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="w-full h-full max-w-5xl flex flex-col gap-4">
          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="relative w-full h-full">
              {!isEnabled ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl sm:rounded-4xl shadow-[8px_8px_24px_#d0d0d0,-8px_-8px_24px_#ffffff] flex items-center justify-center border-4 sm:border-8 border-white">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-[inset_4px_4px_8px_#e0e0e0,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
                      <FiVideoOff className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600 font-medium text-base sm:text-lg">{currentUser?.name}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Camera is off</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-3xl sm:rounded-4xl shadow-[8px_8px_24px_#d0d0d0,-8px_-8px_24px_#ffffff] overflow-hidden border-4 sm:border-8 border-white">
                  <SpeakerLayout participantsBarPosition={'right'} />
                </div>
              )}
            </div>
          </div>

          {/* Participants Bar */}
          {participants && participants.length > 0 && (
            <div className="flex bg-amber-800 gap-2 sm:gap-3 overflow-x-auto pb-2 px-2">
              {visibleParticipants.map((participant: any, idx: number) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-[4px_4px_12px_#d0d0d0,-4px_-4px_12px_#ffffff] overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center"
                >
                  {participant?.image ? (
                    <img src={participant.image} alt={participant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <FiVideoOff className="w-6 h-6 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600 truncate max-w-[80%]">{participant.name}</p>
                    </div>
                  )}
                </div>
              ))}

              {hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllParticipants(true)}
                  className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-[4px_4px_12px_#d0d0d0,-4px_-4px_12px_#ffffff] border-2 border-white bg-white flex items-center justify-center gap-1 hover:shadow-[6px_6px_16px_#c0c0c0,-6px_-6px_16px_#ffffff] transition-all"
                >
                  <FiChevronRight className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-600">+{hiddenCount}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-center pb-4 sm:pb-8 px-4">
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

      {/* All Participants Modal */}
      {showAllParticipants && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">All Participants ({participants.length})</h3>
              <button
                onClick={() => setShowAllParticipants(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {participants.map((participant: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-2xl shadow-[4px_4px_12px_#d0d0d0,-4px_-4px_12px_#ffffff] overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center">
                      {participant?.image ? (
                        <img src={participant.image} alt={participant.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiVideoOff className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center truncate w-full px-1">{participant.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAllParticipants(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
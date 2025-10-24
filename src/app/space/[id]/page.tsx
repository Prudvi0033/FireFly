'use client'
import { axiosInstance } from '@/lib/axios';
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  StreamTheme,
  CallControls,
} from '@stream-io/video-react-sdk';
import { Share2, Loader2, Users, AlertCircle, LogOut } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

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
    const params = useParams()
    const roomId = (params?.id || params?.roomId) as string
    const router = useRouter()
    
    const [roomData, setRoomData] = useState<RoomData | null>(null)
    const [client, setClient] = useState<StreamVideoClient | null>(null)
    const [call, setCall] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<Participant | null>(null)

    const fetchRoomData = async () => {
      try {
        const res = await axiosInstance.get(`/room/${roomId}`)
        setRoomData(res.data)
        return res.data
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        setError(errMsg)
        return null
      }
    }

    const setupUser = async (participant: Participant) => {
      try {
        setLoading(true)
        setError(null)
        setCurrentUser(participant)

        const streamClient = new StreamVideoClient({
          apiKey,
          user: {
            id: participant.userId,
            name: participant.name,
          },
          token: participant.token,
        })
        setClient(streamClient)

        const callInstance = streamClient.call('default', String(roomId))
        await callInstance.join({ create: true })
        
        setCall(callInstance)
        setLoading(false)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        setError(errMsg)
        setLoading(false)
      }
    }

    useEffect(() => {
      const initializeSpace = async () => {
        try {
          setLoading(true)

          if (!roomId || Array.isArray(roomId)) {
            setError('Invalid room ID')
            setLoading(false)
            return
          }

          console.log('🔍 Initializing space for room:', roomId)

          // Fetch room data from Redis
          const room = await fetchRoomData()

          if (!room) {
            console.log('❌ Room not found')
            setLoading(false)
            return
          }

          console.log('✓ Room fetched, participants:', room.participants)

          // Check if current user is already in the room (by checking localStorage for userId)
          const storedUserId = localStorage.getItem(`room_${roomId}_userId`)
          console.log('🔑 Stored userId:', storedUserId)
          
          if (storedUserId) {
            // Find this user in the participants list
            const existingParticipant = room.participants.find(
              (p: Participant) => p.userId === storedUserId
            )
            
            console.log('👤 Found participant:', existingParticipant)

            if (existingParticipant) {
              // User already exists, setup with their stored data
              console.log('✓ Setting up existing user')
              await setupUser(existingParticipant)
              return
            } else {
              // User was in localStorage but not in room (shouldn't happen)
              // Clear and show error
              console.log('⚠️ UserId in localStorage but not in room')
              localStorage.removeItem(`room_${roomId}_userId`)
              setError('Your session has expired. Room no longer active.')
              setLoading(false)
              return
            }
          }

          // No stored user found
          console.log('❌ No stored userId in localStorage')
          setError('User not found in room. Please use the share link to join.')
          setLoading(false)
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error('❌ Init error:', errMsg)
          setError(errMsg)
          setLoading(false)
        }
      }

      if (roomId && !Array.isArray(roomId)) {
        initializeSpace()
      }
    }, [roomId])

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(
          `${process.env.NEXT_PUBLIC_API_URL}/join/${roomId}`
        )
      } catch (error) {
        console.error(error)
      }
    }

    const handleLeaveCall = async () => {
      try {
        if (call) {
          await call.leave()
        }
        localStorage.removeItem(`room_${roomId}_userId`)
        router.push('/')
      } catch (err) {
        console.error('Error leaving call:', err)
      }
    }

    if (loading) {
      return (
        <div className="min-h-screen flex relative items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-gray-300">Loading space...</p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center relative justify-center min-h-screen bg-gray-900">
          <div className="flex flex-col items-center gap-3 bg-gray-800 p-6 rounded-lg max-w-md">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-500 font-semibold text-center">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      )
    }

    if (client && call && currentUser && roomData) {
      return (
        <StreamTheme>
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <div className="flex flex-col relative h-screen bg-gray-900 text-white">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                  <div>
                    <h1 className="text-xl font-bold">{roomData.creatorName} Room</h1>
                    <p className="text-sm text-gray-400">
                      You: <span className="text-emerald-400">{currentUser.name}</span>
                      {currentUser.isAdmin && <span className="ml-2 text-xs bg-emerald-600 px-2 py-1 rounded">Admin</span>}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Video Area */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <SpeakerLayout />
                    </div>

                    {/* Controls */}
                    <div className="border-t fixed border-gray-700 p-4 flex justify-center gap-4 bg-gray-800">
                      <CallControls />
                      <button
                        onClick={handleLeaveCall}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                      >
                        <LogOut size={18} />
                        Leave
                      </button>
                    </div>
                  </div>

                  {/* Participants Sidebar */}
                  <div className="w-80 border-l border-gray-700 bg-gray-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users size={18} />
                        Participants ({roomData.participants.length})
                      </h3>
                    </div>

                    {/* Participants List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {roomData.participants.map((participant) => (
                        <div
                          key={participant.userId}
                          className={`p-3 rounded-lg flex items-center justify-between ${
                            participant.userId === currentUser.userId
                              ? 'bg-emerald-900 border border-emerald-700'
                              : 'bg-gray-700'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{participant.name}</p>
                            {participant.isAdmin && (
                              <p className="text-xs text-emerald-400">Admin</p>
                            )}
                            {participant.userId === currentUser.userId && (
                              <p className="text-xs text-emerald-300">(You)</p>
                            )}
                          </div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                      ))}
                    </div>

                    {/* Room Info */}
                    <div className="border-t border-gray-700 p-4 bg-gray-900 text-xs text-gray-400">
                      <p>Room ID: <span className="text-gray-300 font-mono text-[10px]">{roomData.roomId}</span></p>
                      <p className="mt-2">Share this room with others to invite them</p>
                    </div>
                  </div>
                </div>
              </div>
            </StreamCall>
          </StreamVideo>
        </StreamTheme>
      )
    }

    return null
}

export default Page
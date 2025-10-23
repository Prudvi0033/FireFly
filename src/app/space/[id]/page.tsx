'use client'
import { generateToken } from '@/actions/stream.action';
import { axiosInstance } from '@/lib/axios';
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  StreamTheme,
  CallControls,
} from '@stream-io/video-react-sdk';
import { Share2, Loader2, Users, AlertCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

const apiKey = "k9eqzaujw5rd";

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

const Page = () => {
    const params = useParams()
    const roomId = (params?.id || params?.roomId) as string
    const router = useRouter()
    
    const [roomData, setRoomData] = useState<RoomData | null>(null)
    const [client, setClient] = useState<StreamVideoClient | null>(null)
    const [call, setCall] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showJoinForm, setShowJoinForm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userName, setUserName] = useState("")
    const [joiningUser, setJoiningUser] = useState(false)

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

    const setupUser = async (userData: Participant) => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await generateToken(userData)

        const streamClient = new StreamVideoClient({
          apiKey,
          user: {
            id: response.user.id,
            name: response.user.name,
          },
          token: response.token,
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

          const storedUserData = sessionStorage.getItem('currentUser')

          const room = await fetchRoomData()

          if (!room) {
            setLoading(false)
            return
          }

          if (storedUserData) {
            const userData = JSON.parse(storedUserData)
            await setupUser(userData)
          } else {
            setShowJoinForm(true)
            setLoading(false)
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          setError(errMsg)
          setLoading(false)
        }
      }

      if (roomId && !Array.isArray(roomId)) {
        initializeSpace()
      }
    }, [roomId])

    const handleJoinRoom = async () => {
      if (!userName.trim()) {
        setError('Please enter your name')
        return
      }

      setJoiningUser(true)
      try {
        const newParticipant: Participant = {
          userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: userName.trim(),
          isAdmin: false,
        }

        sessionStorage.setItem('currentUser', JSON.stringify(newParticipant))
        await setupUser(newParticipant)
        setShowJoinForm(false)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        setError(errMsg)
      } finally {
        setJoiningUser(false)
      }
    }

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(
          `${process.env.NEXT_PUBLIC_APP_URL}/space/${roomId}`
        )
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error(error)
      }
    }

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-gray-300">Loading space...</p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )
    }

    if (showJoinForm && !client) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-2">Join Room</h2>
            {roomData && (
              <div className="mb-6 pb-4 border-b border-gray-700">
                <p className="text-sm text-gray-400">
                  Created by: <span className="text-emerald-400 font-semibold">{roomData.creatorName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Users size={14} />
                  {roomData.participants.length} participant{roomData.participants.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Enter your name
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
                disabled={joiningUser}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={joiningUser}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {joiningUser ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </button>
          </div>
        </div>
      )
    }

    if (error && client) {
      return (
        <div className="flex items-center justify-center relative min-h-screen bg-gray-900">
          <div className="flex flex-col items-center gap-3 bg-gray-800 p-6 rounded-lg max-w-md">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-500 font-semibold text-center">{error}</p>
            <button
              onClick={() => {
                sessionStorage.removeItem('currentUser')
                router.push('/')
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      )
    }

    if (client && call) {
      return (
        <StreamTheme>
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <div className="flex flex-col relative h-screen bg-gray-900 text-white">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                  <div>
                    <h1 className="text-xl font-bold">{roomData?.creatorName}s Room</h1>
                    <p className="text-sm text-gray-400">Youre connected</p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                </div>

                <div className="flex-1">
                  <SpeakerLayout />
                </div>

                <div className="border-t border-gray-700 p-4 flex justify-center gap-4 bg-gray-800">
                  <CallControls/>
                </div>

                <div></div>
              </div>
            </StreamCall>
          </StreamVideo>
        </StreamTheme>
      )
    }

    return null
}

export default Page
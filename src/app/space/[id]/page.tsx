'use client'
import { generateToken } from '@/actions/stream.action';
import { axiosInstance } from '@/lib/axios';
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  StreamTheme,
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
    // Handle both [id] and [roomId] route parameters
    const roomId = (params?.id || params?.roomId) as string
    const router = useRouter()
    
    const [roomData, setRoomData] = useState<RoomData | null>(null)
    const [client, setClient] = useState<StreamVideoClient | null>(null)
    const [call, setCall] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showJoinForm, setShowJoinForm] = useState(false)
    const [debugMsg, setDebugMsg] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [userName, setUserName] = useState("")
    const [joiningUser, setJoiningUser] = useState(false)

    const addDebug = (msg: string) => {
      console.log(msg)
      setDebugMsg(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    const fetchRoomData = async () => {
      try {
        addDebug(`Fetching room: ${roomId}`)
        const res = await axiosInstance.get(`/room/${roomId}`)
        addDebug(`✓ Room data received`)
        setRoomData(res.data)
        return res.data
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        addDebug(`✗ Error fetching room: ${errMsg}`)
        setError(errMsg)
        return null
      }
    }

    const setupUser = async (userData: Participant) => {
      try {
        addDebug(`Setting up user: ${userData.name}`)
        setLoading(true)
        setError(null)
        
        addDebug(`Calling generateToken server action...`)
        const response = await generateToken(userData)
        addDebug(`✓ Token generated`)

        addDebug(`Creating StreamVideoClient...`)
        const streamClient = new StreamVideoClient({
          apiKey,
          user: {
            id: response.user.id,
            name: response.user.name,
          },
          token: response.token,
        })
        setClient(streamClient)
        addDebug(`✓ Stream client created`)

        addDebug(`Joining call: ${roomId}...`)
        const callInstance = streamClient.call('default', String(roomId))
        await callInstance.join({ create: true })
        
        setCall(callInstance)
        addDebug(`✓ Call joined successfully`)
        setLoading(false)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        addDebug(`✗ Error: ${errMsg}`)
        setError(errMsg)
        setLoading(false)
      }
    }

    useEffect(() => {
      const initializeSpace = async () => {
        try {
          addDebug('=== Starting initialization ===')
          setLoading(true)

          if (!roomId || Array.isArray(roomId)) {
            addDebug('✗ Invalid room ID')
            setError('Invalid room ID')
            setLoading(false)
            return
          }

          addDebug(`Room ID: ${roomId}`)

          const storedUserData = sessionStorage.getItem('currentUser')
          if (storedUserData) {
            addDebug(`✓ Found stored user data`)
          } else {
            addDebug(`No stored user data, will show join form`)
          }

          const room = await fetchRoomData()

          if (!room) {
            addDebug('✗ Room not found')
            setLoading(false)
            return
          }

          if (storedUserData) {
            addDebug('Setting up stored user...')
            const userData = JSON.parse(storedUserData)
            await setupUser(userData)
          } else {
            addDebug('Showing join form')
            setShowJoinForm(true)
            setLoading(false)
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          addDebug(`✗ Init error: ${errMsg}`)
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
        addDebug(`User joining: ${userName}`)
        await setupUser(newParticipant)
        setShowJoinForm(false)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        addDebug(`✗ Join error: ${errMsg}`)
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
        alert('Link copied!')
      } catch (error) {
        addDebug(`✗ Copy failed: ${error}`)
      }
    }

    // Debug view - always show debug messages
    if (debugMsg.length > 0 || loading) {
      return (
        <div className="min-h-screen relative bg-gray-900 text-white p-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
            
            {/* Current Status */}
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm"><strong>Room ID:</strong> {roomId}</p>
              <p className="text-sm"><strong>API Key:</strong> {apiKey ? '✓ Set' : '✗ Missing'}</p>
              <p className="text-sm"><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p className="text-sm"><strong>Client Ready:</strong> {client ? 'Yes' : 'No'}</p>
              <p className="text-sm"><strong>Call Ready:</strong> {call ? 'Yes' : 'No'}</p>
              {error && <p className="text-sm text-red-400"><strong>Error:</strong> {error}</p>}
            </div>

            {/* Debug Messages */}
            <div className="bg-gray-950 p-4 rounded-lg font-mono text-xs space-y-1 max-h-96 overflow-y-auto mb-4 border border-gray-700">
              {debugMsg.map((msg, i) => (
                <div key={i} className={msg.includes('✗') ? 'text-red-400' : msg.includes('✓') ? 'text-green-400' : 'text-gray-400'}>
                  {msg}
                </div>
              ))}
            </div>

            {/* Join Form - if showing */}
            {showJoinForm && !client && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Join Room</h2>
                {roomData && (
                  <div className="mb-4 text-sm">
                    <p>Created by: <span className="text-emerald-400">{roomData.creatorName}</span></p>
                    <p>Participants: {roomData.participants.length}</p>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-4"
                  disabled={joiningUser}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={joiningUser}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
                >
                  {joiningUser ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            )}

            {/* Video Room - if ready */}
            {client && call && (
              <div className="bg-green-900 p-4 rounded-lg">
                <p className="text-green-100">✓ Video room ready! Call has been established.</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Main video room (if somehow we get here without debug showing)
    if (client && call) {
      return (
        <StreamTheme>
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <div className="flex flex-col h-screen bg-gray-900 text-white">
                <div className="p-4 border-b border-gray-700 bg-gray-800">
                  <h1 className="text-xl font-bold">{roomData?.creatorName}'s Room</h1>
                </div>
                <div className="flex-1">
                  <SpeakerLayout />
                </div>
                <div className="border-t border-gray-700 p-4 flex justify-center gap-4 bg-gray-800">
                  <button onClick={() => call.toggleCamera()} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg">
                    Camera
                  </button>
                  <button onClick={() => call.toggleMicrophone()} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg">
                    Mic
                  </button>
                  <button onClick={() => call.leave()} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg">
                    Leave
                  </button>
                </div>
              </div>
            </StreamCall>
          </StreamVideo>
        </StreamTheme>
      )
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Initializing...</p>
        </div>
      </div>
    )
}

export default Page
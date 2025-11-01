import { getSocket } from '@/lib/socket'
import React, { useEffect, useState } from 'react'
import { MessageCircle, Send, Users } from 'lucide-react'

interface Message {
    roomId: string,
    participantId: string
}

const ChatBox = ({roomId, participantId} : Message) => {
    const [messages, setMessages] = useState<any[]>([])
    const [inputValue, setInputValue] = useState('')
    const [participantCount, setParticipantCount] = useState(0)

    useEffect(() => {
        const socket = getSocket(roomId, participantId)

        socket.on("connect", () => console.log("Connected:", socket.id));
        socket.on("chat:msg", (msg) => {
            console.log("Recieved: ", msg)
            setMessages(prev => [...prev, msg])
        })

        return () => {
            socket.off("disconnect")
            socket.off("chat:msg")
        }
        
    }, [roomId, participantId])

    const handleSendMessage = () => {
        // Empty function - implement later
        console.log("Send message:", inputValue)
        setInputValue('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // Empty function - implement later
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className='fixed bottom-6 border-4 shadow-[_3px_3px_12px_rgba(0,0,0,0.1)] right-6 w-[26rem] h-screen max-h-[calc(100vh-48px)] bg-white rounded-2xl border-gray-100 flex flex-col overflow-hidden z-40'>
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0'>
                <div className='flex items-center gap-2 '>
                    <h3 className='font-semibold text-xl text-gray-900'>Group Chat</h3>
                </div>
                
            </div>

            {/* Messages Container */}
            <div className='flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center'>
                {messages.length === 0 ? (
                    <div className='text-center flex flex-col items-center gap-2'>
                        <MessageCircle size={48} className='text-gray-200' strokeWidth={1.5} />
                        <p className='text-gray-300 text-xs font-light'>Start a conversation</p>
                    </div>
                ) : (
                    <div className='w-full space-y-3'>
                        {messages.map((msg, idx) => (
                            <div key={idx} className='text-gray-700 text-sm bg-gray-50 p-3 rounded-lg'>
                                {msg}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className='border-t border-gray-200 p-4 bg-white flex-shrink-0'>
                <div className='flex gap-2'>
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder='Type a message...'
                        className='flex-1 px-3 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm'
                    />
                    <button
                        onClick={handleSendMessage}
                        className='px-3 shadow-[_-2px_2px_3px_rgba(0,0,0,0.3),_inset_-3px_3px_8px_rgba(255,255,255,0.3)] py-3 bg-gradient-to-br from-emerald-400 to-green-600 cursor-pointer text-white rounded-full hover:bg-emerald-800 transition-colors flex items-center justify-center flex-shrink-0 h-full'
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatBox
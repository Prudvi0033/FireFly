import { getSocket } from '@/lib/socket'
import React, { useEffect } from 'react'

interface Message {
    roomId: string,
    participantId: string
}

const ChatBox = ({roomId, participantId} : Message) => {
    useEffect(() => {
        const socket = getSocket(roomId, participantId)

        socket.on("connect", () => console.log("Connected:", socket.id));
        socket.on("chat:msg", (msg) => console.log("Recieved: ",msg))

        return () => {
            socket.on("disconnect", () => {
                socket.off("chat:msg")
            })
        }
        
    }, [roomId, participantId])
  return (
    <div className='p-2 min-h-screen bg-red-300'>ChatBox</div>
  )
}

export default ChatBox
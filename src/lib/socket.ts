import {Socket, io} from 'socket.io-client'

let socket: Socket | null = null;

export const getSocket = (roomId: string, participantId: string) : Socket => {
    if(!socket){
        socket = io(process.env.NEXT_PUBLIC_API_URL!, {
            auth: {
                roomId,
                participantId
            },
            transports: ['websocket']
        })
    }
    return socket
}
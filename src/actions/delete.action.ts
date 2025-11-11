'use server'

import redis from "@/lib/redis"

export const deleteActiveroom = async (roomId: string) => {
    try {
        await redis.sRem("active_rooms", roomId)
        console.log("Room deleted");
    } catch (error) {
        console.log("error in deleting room", error);
    }
}

export const deleteMessagesRoom = async (roomId: string) => {
    try {
        await redis.del(`room:${roomId}:msg`);
        console.log("Deleted messages room");
    } catch (error) {
        console.log("Error in deleting room",error);
    }
}

export const deleteRoom = async (roomId : string) => {
    try {
        await redis.del(`room:${roomId}`)
        console.log("Removed the room");
    } catch (error) {
        console.log("error in deleting room action", error);
        
    }
}
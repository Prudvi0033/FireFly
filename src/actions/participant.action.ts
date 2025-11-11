'use server';

import redis from '@/lib/redis';
import { RoomData } from '@/types/types';

export const removeParticipant = async (roomId: string, participantId: string) => {
  try {
    if (!roomId || !participantId) {
      console.log('❌ Missing roomId or participantId', { roomId, participantId });
      return { success: false, message: 'Missing roomId or participantId' };
    }

    const roomData = await redis.get(`room:${roomId}`);
    if (!roomData) {
      console.log('❌ Room not found in Redis', `room:${roomId}`);
      return { success: false, message: 'Room not found' };
    }

    const room: RoomData = JSON.parse(roomData);

    const updatedParticipants = room.participants.filter(
      (p) => p.userId !== participantId
    );

    if (updatedParticipants.length === room.participants.length) {
      console.log('❌ Participant not found in room');
      return { success: false, message: 'Participant not found' };
    }

    room.participants = updatedParticipants;
    await redis.set(`room:${roomId}`, JSON.stringify(room));

    console.log('✅ Participant removed successfully', { participantId });
    return { success: true, message: 'Participant removed successfully' };
  } catch (error) {
    console.error('❌ Error removing participant:', error);
    return { success: false, message: 'Failed to remove participant' };
  }
};

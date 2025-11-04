export interface Participant {
  userId: string;
  name: string;
  isAdmin: boolean;
  token: string;
}
export interface RoomData {
  roomId: string;
  creatorName: string;
  createdAt: number;
  isActive: boolean;
  participants: Participant[];
}

export interface Message {
  sender: {
    senderId: string;
    name: string;
    isAdmin: boolean;
  };
  text: string;
  timestamp: number;
}
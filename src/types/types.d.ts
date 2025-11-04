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
  userId: string;
  name: string;
  text: string;
  timestamp: number;
}
export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string | null;
}

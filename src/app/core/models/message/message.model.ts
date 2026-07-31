export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string | null;
  isDeleted: boolean;
  replyToMessageId: number | null;
  replyToContent: string | null;
  replyToHasImage: boolean;
  replyToSenderId: number | null;
  replyToIsDeleted: boolean;
  forwardedFromMessageId: number | null;
}

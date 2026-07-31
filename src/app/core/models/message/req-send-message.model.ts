export interface SendMessageRequest {
  receiverId: number;
  content: string | null;
  imagePublicId: string | null;
  replyToMessageId?: number | null;
  forwardFromMessageId?: number | null;
}

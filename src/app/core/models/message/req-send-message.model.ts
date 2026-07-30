export interface SendMessageRequest {
  receiverId: number;
  content: string | null;
  imagePublicId: string | null;
}

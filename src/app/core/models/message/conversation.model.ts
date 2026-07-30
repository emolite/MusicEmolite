export interface Conversation {
  friendUserId: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastMessageHasImage: boolean;
  isLastMessageMine: boolean;
  lastMessageAt: string | null;
  unreadCount: number;
}

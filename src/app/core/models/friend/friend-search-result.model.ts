export type FriendStatus = 'NONE' | 'FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED';

export interface FriendSearchResult {
  userId: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  friendStatus: FriendStatus;
  friendshipId: number | null;
}

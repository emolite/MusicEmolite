export interface FriendUser {
  friendshipId: number;
  userId: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string | null;
}

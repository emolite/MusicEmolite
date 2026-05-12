export interface SongResponse {
  id: number;
  title: string;
  duration: number;
  fileUrl: string;
  imgUrl: string;
  albumId?: number;
  artistName?: string;
  isLiked: boolean;
  likes: number;
  views: number;
  createdAt?: string;
  createdBy?: number;
  isActived?: boolean;
  isDeleted?: boolean;
}
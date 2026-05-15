export interface SongResponse {
  id: number;
  title: string;
  duration: number;
  fileUrl: string;
  imgUrl: string;
  albumId?: number;
  releaseDate?: string;
  artistName?: string;
  isLiked: boolean;
  likes: number;
  views: number;
  typeSong: string;
  createdAt?: string;
  createdBy?: number;
  isActived?: boolean;
  isDeleted?: boolean;
}
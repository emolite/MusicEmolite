import { LyricsLine } from "./req-song.model";

export interface SongResponse {
  id: number;
  title: string;
  duration: number;
  fileUrl: string;
  imgUrl: string;
  albumId?: number;
  albumName?: string;
  albumIds?: number[]; 
  releaseDate?: string;
  artistName?: string;
  isLiked: boolean;
  likes: number;
  views: number;
  typeSong: string;
  syncedLyrics?: LyricsLine[];
  lyrics?: string;
  youtubeVideoId?: string;
  sourceType?: number;
  createdAt?: string;
  createdBy?: number;
  isActived?: boolean;
  isDeleted?: boolean;
}
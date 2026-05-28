import { SongType } from "../../enums/song-type.enums";

export interface SongRequest {
  keyword?: string;
  albumId?: number;
  type?: number;
  isActived?: boolean;
  sortBy?: string;
}

export interface SongCreateRequest {
  title: string;
  releaseDate: string;
  albumId: number;
  artistName: string;
  fileUrl: File;
  imgUrl: File;
  type: SongType;
  lyrics?: SongLyricsCreateRequest;
}

export interface LyricsLine {
  time: number;
  text: string;
}

export interface SongLyricsCreateRequest {
  lyrics: string;
  syncedLyrics: LyricsLine[];
}
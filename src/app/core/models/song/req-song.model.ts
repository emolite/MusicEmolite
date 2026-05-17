import { SongType } from "../../enums/song-type.enums";

export interface SongRequest {
  keyword?: string;
}

export interface SongCreateRequest{
  title: string;
  releaseDate: string;
  albumId: number;
  artistId: number;
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
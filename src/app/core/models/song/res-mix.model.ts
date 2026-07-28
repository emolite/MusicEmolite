import { SongResponse } from "./res-song.model";

export interface MixPlaylistResponse {
  key: string;
  title: string;
  description?: string;
  coverImages: string[];
  totalSongs: number;
  songs: SongResponse[];
}

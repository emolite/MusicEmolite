
export interface LyricsLine {
  time: number;
  text: string;
}

export interface LyricsResponseDto {
  id: number;
  name: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  instrumental: boolean;
  lyrics: string;
  rawSyncedLyrics: string;
  syncedLyrics: LyricsLine[];
}
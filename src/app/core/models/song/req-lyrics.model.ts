export interface LyricsRequestDto {
  title?: string;
  artist?: string;
}

export interface LyricsSearchRequestDto {
  query?: string;
  title?: string;
  artist?: string;
  album?: string;
}

export interface PublishLyricsRequest {
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  plainLyrics: string;
  syncedLyrics: string;
}
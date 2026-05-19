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
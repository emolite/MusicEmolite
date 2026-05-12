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
}
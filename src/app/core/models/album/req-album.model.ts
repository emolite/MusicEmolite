export interface AlbumRequest {
  keyword?: string;
  albumType?: number;
  isActived?: boolean;
  sortBy?: string;
}

export interface AlbumCreateRequest {
  title: string;
  releaseDate: string;
  albumType: number;
  image: File;
}
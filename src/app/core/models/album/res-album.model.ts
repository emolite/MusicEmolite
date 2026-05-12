export interface AlbumResponse {
  id: number;
  title: string;
  releaseDate?: string;
  artistId: number;
  albumType?: number;
  albumTypeName?: string;
  isActived: boolean;
  isDeleted: boolean;
  createdAt?: string;
  createdBy?: number;
}
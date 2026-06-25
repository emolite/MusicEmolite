export interface AlbumResponse {
  id: number;
  title: string;
  releaseDate?: string;
  artistId: number;
  uri?: string;
  albumType?: number;
  albumTypeName?: string;
  isActived: boolean;
  isDeleted: boolean;
  createdAt?: string;
  createdBy?: number;
}
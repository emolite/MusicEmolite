export interface ArtistResponse {
  id: number;
  name: string;
  stageName: string;
  country: string;

  isActived?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}
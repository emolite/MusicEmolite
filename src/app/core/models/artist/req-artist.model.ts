export interface ArtistRequest {
  keyword?: string;
  country?: string;
  isActived?: boolean;
  sortBy?: string;
}

export interface ArtistCreateRequest {
  name: string;
  stageName: string;
  country: string;
}

export interface ArtistUpdateRequest {
  name: string;
  stageName: string;
  country: string;
}
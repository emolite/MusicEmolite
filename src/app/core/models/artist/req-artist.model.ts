export interface ArtistRequest {
  keyword?: string;
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
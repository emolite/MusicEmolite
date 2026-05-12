export interface CurrentUserResponse {
  refCode: string;
  userId: number;
  username: string;
  email: string;
  roleCode: string;
  profile: CurrentUserProfile | null;
}

export interface CurrentUserProfile {
  refCode: string;
  userId: number;
  fullName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bio: string | null;
  uri: string | null;
}
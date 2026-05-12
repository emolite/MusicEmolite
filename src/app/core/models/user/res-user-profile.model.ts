export interface ResUserProfile {
  id: number;
  refCode: string;
  userId: number;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  avatarFileId: number | null;

  isActived: boolean;
  isDeleted: boolean;

  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
}
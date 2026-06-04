export interface ResBankUser {
  id: number;
  userProfileId: number;
  bankCode: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  vietQrUrl?: string;
  qrImageUrl?: string;
  isActive: boolean;
  createdAt?: string;
}
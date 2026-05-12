export interface BaseResponse<T> {
  code?: string;
  type?: string;
  message?: string;
  totalRecords?: number;
  totalPages?: number;
  data?: T;
}
export interface BaseTableResponse<T> {
  code?: string;
  type?: string;
  message?: string;
  totalRecords: number;
  totalPages: number;
  data?: T[];
}
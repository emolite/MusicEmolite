export interface BaseSearchDto<T> {
  page?: number;
  pageSize?: number;
  asc?: boolean;
  searchParams?: T;
}
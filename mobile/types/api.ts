export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  last_page: number;
}

export interface MessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
}

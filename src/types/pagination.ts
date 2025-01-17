export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  prev_page_url: string | null;
  next_page_url: string | null;
}

export interface PaginationLinks {
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[];
}

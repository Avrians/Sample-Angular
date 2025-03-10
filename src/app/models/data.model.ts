export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: boolean;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
export interface ActivityFilter {
  userId?: number;
  limit?: number;
  offset?: number;
  sortOrder?: 'asc' | 'desc';
}

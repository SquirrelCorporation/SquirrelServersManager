/**
 * Generic paginated response DTO
 */
export class PaginatedResponseDto<T> {
  data: T[];
  metadata: {
    total: number;
    pageSize: number;
    current: number;
  };

  constructor(
    data: T[],
    metadata: {
      total: number;
      pageSize: number;
      current: number;
    },
  ) {
    this.data = data;
    this.metadata = metadata;
  }
}

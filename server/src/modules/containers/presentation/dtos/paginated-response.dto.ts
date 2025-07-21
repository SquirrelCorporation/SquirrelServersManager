import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadata {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Number of items per page' })
  pageSize: number;

  @ApiProperty({ description: 'Current page number' })
  current: number;

  constructor(total: number, pageSize: number, current: number) {
    this.total = total;
    this.pageSize = pageSize;
    this.current = current;
  }
}

/**
 * Generic paginated response DTO
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'List of items for the current page', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetadata })
  metadata: PaginationMetadata;

  constructor(data: T[], pagination: { total: number; pageSize: number; current: number }) {
    this.data = data;
    this.metadata = new PaginationMetadata(
      pagination.total,
      pagination.pageSize,
      pagination.current,
    );
  }
}

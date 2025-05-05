import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataDto {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total = 0;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  pageSize = 10;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages = 0;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage = false;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage = false;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetadataDto,
  })
  metadata: PaginationMetadataDto;

  constructor(data: T[], total: number, page: number, pageSize: number) {
    this.data = data;
    this.metadata = {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page < Math.ceil(total / pageSize),
      hasPreviousPage: page > 1,
    };
  }
}

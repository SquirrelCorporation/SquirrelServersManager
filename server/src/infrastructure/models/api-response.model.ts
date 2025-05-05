import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request',
  })
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: ['field1 is required', 'field2 must be a number'],
    required: false,
    isArray: true,
    type: String,
  })
  errors?: string[];

  @ApiProperty({
    description: 'Error code for client-side handling',
    example: 'VALIDATION_ERROR',
    required: false,
  })
  code?: string;

  constructor(statusCode: number, message: string, errors?: string[], code?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.code = code;
  }
}

export class ApiSuccessResponse<T> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export class PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;

  constructor(
    statusCode: number,
    message: string,
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    super(statusCode, message, data);
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

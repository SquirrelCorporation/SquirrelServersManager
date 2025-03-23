export class TaskResponseDto {
  id!: string;
  ident!: string;
  name?: string;
  playbook?: string;
  status!: string;
  target?: string[];
  options?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TaskLogResponseDto {
  id!: string;
  taskIdent!: string;
  eventId?: string;
  content!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TaskStatusResponseDto {
  id!: string;
  taskIdent!: string;
  status!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PaginatedResponseDto<T> {
  data: T[];
  metadata: {
    total: number;
    pageSize: number;
    current: number;
  };

  constructor(data: T[], metadata: { total: number; pageSize: number; current: number }) {
    this.data = data;
    this.metadata = metadata;
  }
}

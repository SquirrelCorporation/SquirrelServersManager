export interface LogsResponseMeta {
  total: number;
  success: boolean;
  pageSize: number;
  current: number;
}

export interface LogsResponse<T> {
  data: T[];
  meta?: LogsResponseMeta;
  message: string;
}

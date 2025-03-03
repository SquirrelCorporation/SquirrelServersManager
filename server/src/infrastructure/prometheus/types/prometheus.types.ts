export interface PrometheusConfig {
  endpoint: string;
  baseURL: string;
  username: string;
  password: string;
}

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface QueryResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export type MetricValue = {
  date: string;
  value: string;
  name: string;
};

export type AggregatedMetric = {
  value: number;
  name: string;
};

export type LatestMetric = {
  value: number;
  date?: string;
};

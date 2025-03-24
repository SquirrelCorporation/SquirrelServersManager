import { Registry } from 'prom-client';

export const METRICS_SERVICE = 'METRICS_SERVICE';

/**
 * Types of metrics that can be collected
 */
export enum MetricType {
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage',
  MEMORY_FREE = 'memory_free',
  STORAGE_USAGE = 'storage_usage',
  STORAGE_FREE = 'storage_free',
  CONTAINER_CPU_USAGE = 'container_cpu_usage',
  CONTAINER_MEMORY_USAGE = 'container_memory_usage',
}

/**
 * Interface for the Metrics Service
 */
export interface MetricsServiceInterface {
  /**
   * Get the Prometheus registry
   * @returns The Prometheus registry
   */
  getRegistry(): Registry;

  /**
   * Set a metric value for a device
   * @param type The type of metric
   * @param value The value to set
   * @param deviceUuid The UUID of the device
   */
  setMetric(type: MetricType, value: number, deviceUuid: string): Promise<void>;

  /**
   * Set a metric value for a container
   * @param type The type of metric
   * @param value The value to set
   * @param containerId The ID of the container
   */
  setContainerMetric(type: MetricType, value: number, containerId: string): Promise<void>;

  /**
   * Set multiple metrics for a device
   * @param metrics Array of metrics with type and value
   * @param deviceUuid The UUID of the device
   */
  setMetrics(
    metrics: Array<{ type: MetricType; value: number }>,
    deviceUuid: string,
  ): Promise<void>;

  /**
   * Get the names of all metrics
   * @returns Array of metric names
   */
  getAllMetricNames(): string[];
}

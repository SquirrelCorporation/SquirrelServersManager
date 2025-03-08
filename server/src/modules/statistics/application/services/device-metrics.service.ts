import { Injectable, Logger } from '@nestjs/common';
import { Gauge, Registry } from 'prom-client';

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
 * Definition of a metric with its properties
 */
interface MetricDefinition {
  name: string;
  help: string;
  type: MetricType;
  gauge: Gauge<string>;
}

/**
 * Service for managing device and container metrics using Prometheus
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly registry: Registry;
  private metrics: Map<MetricType, MetricDefinition>;

  constructor() {
    this.registry = new Registry();
    this.metrics = new Map();
    this.initializeMetrics();
  }

  /**
   * Initialize all metrics and register them with the Prometheus registry
   */
  private initializeMetrics(): void {
    // Define all metrics
    const metricsDefinitions: MetricDefinition[] = [
      {
        type: MetricType.CPU_USAGE,
        name: 'device_cpu_usage_percent',
        help: 'CPU usage percent of devices',
        gauge: new Gauge({
          name: 'device_cpu_usage_percent',
          help: 'CPU usage percent of devices',
          labelNames: ['device_id'],
        }),
      },
      {
        type: MetricType.MEMORY_USAGE,
        name: 'device_memory_usage_percent',
        help: 'Memory usage in percent for devices',
        gauge: new Gauge({
          name: 'device_memory_usage_percent',
          help: 'Memory usage in percent for devices',
          labelNames: ['device_id'],
        }),
      },
      {
        type: MetricType.MEMORY_FREE,
        name: 'device_memory_free_percent',
        help: 'Memory free in percent for devices',
        gauge: new Gauge({
          name: 'device_memory_free_percent',
          help: 'Memory free in percent for devices',
          labelNames: ['device_id'],
        }),
      },
      {
        type: MetricType.STORAGE_USAGE,
        name: 'device_storage_usage_percent',
        help: 'File storage usage in percent for devices',
        gauge: new Gauge({
          name: 'device_storage_usage_percent',
          help: 'File storage usage in percent for devices',
          labelNames: ['device_id'],
        }),
      },
      {
        type: MetricType.STORAGE_FREE,
        name: 'device_storage_free_percent',
        help: 'File storage free in percent for devices',
        gauge: new Gauge({
          name: 'device_storage_free_percent',
          help: 'File storage free in percent for devices',
          labelNames: ['device_id'],
        }),
      },
      {
        type: MetricType.CONTAINER_CPU_USAGE,
        name: 'container_cpu_usage_percent',
        help: 'CPU usage in percent for containers',
        gauge: new Gauge({
          name: 'container_cpu_usage_percent',
          help: 'CPU usage in percent for containers',
          labelNames: ['container_id'],
        }),
      },
      {
        type: MetricType.CONTAINER_MEMORY_USAGE,
        name: 'container_memory_usage_percent',
        help: 'Memory usage in percent for containers',
        gauge: new Gauge({
          name: 'container_memory_usage_percent',
          help: 'Memory usage in percent for containers',
          labelNames: ['container_id'],
        }),
      },
    ];

    // Register all metrics
    metricsDefinitions.forEach((metric) => {
      this.metrics.set(metric.type, metric);
      this.registry.registerMetric(metric.gauge);
    });
  }

  /**
   * Get the Prometheus registry
   * @returns The Prometheus registry
   */
  public getRegistry(): Registry {
    return this.registry;
  }

  /**
   * Set a metric value for a device
   * @param type The type of metric
   * @param value The value to set
   * @param deviceUuid The UUID of the device
   */
  public async setMetric(type: MetricType, value: number, deviceUuid: string): Promise<void> {
    try {
      const metric = this.metrics.get(type);
      if (!metric) {
        throw new Error(`Metric type ${type} not found`);
      }

      if (!deviceUuid) {
        throw new Error('Device UUID is required');
      }

      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`Invalid value for metric ${type}: ${value}`);
      }

      metric.gauge.set({ device_id: deviceUuid }, value);
      this.logger.debug(`Set ${metric.name} for device ${deviceUuid} to ${value}`);
    } catch (error) {
      this.logger.error(`Failed to set metric ${type} for device ${deviceUuid}: ${error}`);
      throw error;
    }
  }

  /**
   * Set a metric value for a container
   * @param type The type of metric
   * @param value The value to set
   * @param containerId The ID of the container
   */
  public async setContainerMetric(
    type: MetricType,
    value: number,
    containerId: string,
  ): Promise<void> {
    try {
      const metric = this.metrics.get(type);
      if (!metric) {
        throw new Error(`Metric type ${type} not found`);
      }

      if (!containerId) {
        throw new Error('Container ID is required');
      }

      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`Invalid value for metric ${type}: ${value}`);
      }

      metric.gauge.set({ container_id: containerId }, value);
      this.logger.debug(`Set ${metric.name} for container ${containerId} to ${value}`);
    } catch (error) {
      this.logger.error(`Failed to set metric ${type} for container ${containerId}: ${error}`);
      throw error;
    }
  }

  /**
   * Set multiple metrics for a device
   * @param metrics Array of metrics with type and value
   * @param deviceUuid The UUID of the device
   */
  public async setMetrics(
    metrics: Array<{ type: MetricType; value: number }>,
    deviceUuid: string,
  ): Promise<void> {
    try {
      await Promise.all(
        metrics.map((metric) => this.setMetric(metric.type, metric.value, deviceUuid)),
      );
    } catch (error) {
      this.logger.error(`Failed to set multiple metrics for device ${deviceUuid}: ${error}`);
      throw error;
    }
  }

  /**
   * Get the name of a metric by type
   * @param type The type of metric
   * @returns The name of the metric
   */
  public getMetricName(type: MetricType): string {
    const metric = this.metrics.get(type);
    if (!metric) {
      throw new Error(`Metric type ${type} not found`);
    }
    return metric.name;
  }

  /**
   * Get the names of all metrics
   * @returns Array of metric names
   */
  public getAllMetricNames(): string[] {
    return Array.from(this.metrics.values()).map((metric) => metric.name);
  }
}
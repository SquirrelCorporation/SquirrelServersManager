import { MetricDefinition, METRICS_DEFINITIONS, MetricType } from '@infrastructure/prometheus/prometheus.service';
import { Injectable, Logger } from '@nestjs/common';
import { Registry } from 'prom-client';
import { IMetricsService } from '../../domain/interfaces/metrics-service.interface';

/**
 * Service for managing device and container metrics using Prometheus
 */
@Injectable()
export class MetricsService implements IMetricsService {
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
    // Register all metrics
    METRICS_DEFINITIONS.forEach((metric) => {
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
   * Get the names of all metrics
   * @returns Array of metric names
   */
  public getAllMetricNames(): string[] {
    return Array.from(this.metrics.values()).map((metric) => metric.name);
  }
}

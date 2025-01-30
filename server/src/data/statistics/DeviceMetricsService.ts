import { Gauge, Registry } from 'prom-client';
import PinoLogger from '../../logger';

const logger = PinoLogger.child({ module: 'DeviceMetricsService' }, { msgPrefix: '[METRICS] - ' });

// Types
export enum MetricType {
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage',
  MEMORY_FREE = 'memory_free',
  STORAGE_USAGE = 'storage_usage',
  STORAGE_FREE = 'storage_free',
}

interface MetricDefinition {
  name: string;
  help: string;
  type: MetricType;
  gauge: Gauge<string>;
}

export class DeviceMetricsService {
  private static instance: DeviceMetricsService;
  private readonly registry: Registry;
  private metrics: Map<MetricType, MetricDefinition>;

  private constructor() {
    this.registry = new Registry();
    this.metrics = new Map();
    this.initializeMetrics();
  }

  public static getInstance(): DeviceMetricsService {
    if (!DeviceMetricsService.instance) {
      DeviceMetricsService.instance = new DeviceMetricsService();
    }
    return DeviceMetricsService.instance;
  }

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
    ];

    // Register all metrics
    metricsDefinitions.forEach((metric) => {
      this.metrics.set(metric.type, metric);
      this.registry.registerMetric(metric.gauge);
    });
  }

  public getRegistry(): Registry {
    return this.registry;
  }

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
      logger.debug(`Set ${metric.name} for device ${deviceUuid} to ${value}`);
    } catch (error) {
      logger.error(`Failed to set metric ${type} for device ${deviceUuid}: ${error}`);
      throw error;
    }
  }

  public async setMetrics(
    metrics: Array<{ type: MetricType; value: number }>,
    deviceUuid: string,
  ): Promise<void> {
    try {
      await Promise.all(
        metrics.map((metric) => this.setMetric(metric.type, metric.value, deviceUuid)),
      );
    } catch (error) {
      logger.error(`Failed to set multiple metrics for device ${deviceUuid}: ${error}`);
      throw error;
    }
  }

  public getMetricName(type: MetricType): string {
    const metric = this.metrics.get(type);
    if (!metric) {
      throw new Error(`Metric type ${type} not found`);
    }
    return metric.name;
  }

  public getAllMetricNames(): string[] {
    return Array.from(this.metrics.values()).map((metric) => metric.name);
  }
}

const deviceMetricsServiceInstance = DeviceMetricsService.getInstance();
export default deviceMetricsServiceInstance;

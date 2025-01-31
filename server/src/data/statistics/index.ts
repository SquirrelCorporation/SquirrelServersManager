import deviceMetricsService, { MetricType } from './DeviceMetricsService';

// Metrics Registry
export const deviceRegistry = deviceMetricsService.getRegistry();

async function setCpuUsage(value: number, deviceUuid: string) {
  await deviceMetricsService.setMetric(MetricType.CPU_USAGE, value, deviceUuid);
}

async function setMemoryUsage(value: number, deviceUuid: string) {
  await deviceMetricsService.setMetric(MetricType.MEMORY_USAGE, value, deviceUuid);
}

async function setMemoryFree(value: number, deviceUuid: string) {
  await deviceMetricsService.setMetric(MetricType.MEMORY_FREE, value, deviceUuid);
}

async function setFileStorageUsage(value: number, deviceUuid: string) {
  await deviceMetricsService.setMetric(MetricType.STORAGE_USAGE, value, deviceUuid);
}

async function setFileStorageFree(value: number, deviceUuid: string) {
  await deviceMetricsService.setMetric(MetricType.STORAGE_FREE, value, deviceUuid);
}

// Batch update all metrics for a device
async function setDeviceMetrics(
  metrics: Array<{ type: MetricType; value: number }>,
  deviceUuid: string,
) {
  await deviceMetricsService.setMetrics(metrics, deviceUuid);
}

export default {
  setCpuUsage,
  setMemoryUsage,
  setFileStorageUsage,
  setMemoryFree,
  setFileStorageFree,
  setDeviceMetrics, // New batch update function
};

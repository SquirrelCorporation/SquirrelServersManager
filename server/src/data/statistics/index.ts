import { Gauge, Registry } from 'prom-client';

// Metrics Registry
export const deviceRegistry = new Registry();

// Collect custom device metrics
const cpuUsageGauge = new Gauge({
  name: 'device_cpu_usage_percent',
  help: 'CPU usage percent of devices',
  labelNames: ['device_id'],
});
const memoryUsageGauge = new Gauge({
  name: 'device_memory_usage_percent',
  help: 'Memory usage in percent for devices',
  labelNames: ['device_id'],
});
const memoryFreeGauge = new Gauge({
  name: 'device_memory_free_percent',
  help: 'Memory free in percent for devices',
  labelNames: ['device_id'],
});
const fileStorageGauge = new Gauge({
  name: 'device_storage_usage_percent',
  help: 'File storage usage in percent for devices',
  labelNames: ['device_id'],
});
const fileStorageFreeGauge = new Gauge({
  name: 'device_storage_free_percent',
  help: 'File storage free in percent for devices',
  labelNames: ['device_id'],
});

// Register metrics
deviceRegistry.registerMetric(cpuUsageGauge);
deviceRegistry.registerMetric(memoryUsageGauge);
deviceRegistry.registerMetric(fileStorageGauge);
deviceRegistry.registerMetric(memoryFreeGauge);
deviceRegistry.registerMetric(fileStorageFreeGauge);

async function setCpuUsage(value: number, deviceUuid: string) {
  cpuUsageGauge.set({ device_id: deviceUuid }, value);
}

async function setMemoryUsage(value: number, deviceUuid: string) {
  memoryUsageGauge.set({ device_id: deviceUuid }, value);
}

async function setMemoryFree(value: number, deviceUuid: string) {
  memoryFreeGauge.set({ device_id: deviceUuid }, value);
}

async function setFileStorageUsage(value: number, deviceUuid: string) {
  fileStorageGauge.set({ device_id: deviceUuid }, value);
}
async function setFileStorageFree(value: number, deviceUuid: string) {
  fileStorageFreeGauge.set({ device_id: deviceUuid }, value);
}

export default {
  setCpuUsage,
  setMemoryUsage,
  setFileStorageUsage,
  setMemoryFree,
  setFileStorageFree,
};

import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const STATISTICS_API_URL = '/api/statistics';

export async function getDeviceStats(
  deviceId: string,
  type: string,
  params: API.DeviceStatParams,
  options?: Record<string, any>,
) {
  return request<API.DeviceStats>(`${STATISTICS_API_URL}/devices/${deviceId}/stats/${type}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getDeviceStat(
  deviceId: string,
  type: string,
  params?: API.DeviceStatParams,
  options?: Record<string, any>,
) {
  return request<API.SimpleDeviceStat>(
    `${STATISTICS_API_URL}/devices/${deviceId}/stat/${type}`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getDashboardDevicesStats(
  devicesId: string[],
  type: string,
  params: API.DashboardDevicesStatParams,
  options?: Record<string, any>,
) {
  return request<API.DeviceStats>(`${STATISTICS_API_URL}/dashboard/${type}`, {
    method: 'POST',
    data: { devices: devicesId },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getDashboardAveragedDevicesStats(
  devicesId: string[],
  type: string,
  params: API.DashboardDevicesStatParams,
  options?: Record<string, any>,
) {
  return request<API.AveragedDeviceStat>(
    `${STATISTICS_API_URL}/dashboard/averaged/${type}`,
    {
      method: 'POST',
      data: { devices: devicesId },
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getDashboardSystemPerformance(
  options?: Record<string, any>,
) {
  return request<API.PerformanceStatResponse>(
    `${STATISTICS_API_URL}/dashboard/performances`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function getDashboardAvailabilityStat(
  options?: Record<string, any>,
) {
  return request<API.DeviceStatAvailability>(
    `${STATISTICS_API_URL}/dashboard/availability`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

import { request } from '@umijs/max';

export async function getDeviceStats(
  deviceId: string,
  type: string,
  params: API.DeviceStatParams,
  options?: Record<string, any>,
) {
  return request<API.DeviceStats>(`/api/devices/${deviceId}/stats/${type}`, {
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
  params: API.DeviceStatParams,
  options?: Record<string, any>,
) {
  return request<API.SimpleDeviceStat>(
    `/api/devices/${deviceId}/stat/${type}`,
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
  return request<API.DeviceStats>(`/api/devices/dashboard/stats/${type}`, {
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
    `/api/devices/dashboard/stats/averaged/${type}`,
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
    `/api/devices/dashboard/stats/performances`,
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
    `/api/devices/dashboard/stats/availability`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

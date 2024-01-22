import { request } from '@umijs/max';

export async function getDeviceStats(deviceId: string, type: string, params: API.DeviceStatParams, options?: Record<string, any>) {
  return request<API.DeviceStats>(`/api/devices/${deviceId}/stats/${type}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getDeviceStat(deviceId: string, type: string, params: API.DeviceStatParams, options?: Record<string, any>) {
  return request<API.SimpleDeviceStat>(`/api/devices/${deviceId}/stat/${type}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

import { request } from '@umijs/max';

export async function getDeviceStats(deviceId: string, type: string, params: API.DeviceStatParams, options?: { [key: string]: any }) {
  return request<API.DeviceStats>(`/api/devices/${deviceId}/stats/${type}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

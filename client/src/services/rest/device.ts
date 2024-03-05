// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getDevices(
  params?: API.DeviceListParams,
  options?: { [key: string]: any },
) {
  return request<API.DeviceList>('/api/devices', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putDevice(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.DeviceItem>('/api/devices', {
    data: { ip: ip, ...deviceAuth },
    method: 'PUT',
    ...(options || {}),
  });
}

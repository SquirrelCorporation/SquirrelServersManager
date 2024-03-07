// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getDeviceAuth(
  deviceId: string,
  options?: { [key: string]: any },
) {
  return request<API.DeviceAuthResponse>(`/api/devices/${deviceId}/auth`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function putDeviceAuth(
  deviceId: string,
  data: API.DeviceAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResponse>(`/api/devices/${deviceId}/auth`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

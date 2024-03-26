// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';
import { SimpleResult } from 'ssm-shared-lib/distribution/types/api';

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
  return request<API.SimpleResult>(`/api/devices/${deviceId}/auth`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function postLogsSetting(
  type: string,
  value: number,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/settings/logs/${type}`, {
    method: 'POST',
    ...{},
    data: { value: value },
    ...(options || {}),
  });
}

export async function postDeviceSetting(
  type: string,
  value: number,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/settings/devices/${type}`, {
    method: 'POST',
    ...{},
    data: { value: value },
    ...(options || {}),
  });
}

export async function postDashboardSetting(
  type: string,
  value: number,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/settings/dashboard/${type}`, {
    method: 'POST',
    ...{},
    data: { value: value },
    ...(options || {}),
  });
}

export async function postResetSettings(options?: Record<string, any>) {
  return request<API.SimpleResult>(`/api/settings/reset`, {
    method: 'POST',
    ...{},
    ...(options || {}),
  });
}

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

export async function postRestartServer(options?: Record<string, any>) {
  return request<API.SimpleResult>(`/api/settings/advanced/restart`, {
    method: 'POST',
    ...{},
    ...(options || {}),
  });
}

export async function deleteServerLogs(options?: Record<string, any>) {
  return request<API.SimpleResult>(`/api/settings/advanced/logs`, {
    method: 'DELETE',
    ...{},
    ...(options || {}),
  });
}

export async function deleteAnsibleLogs(options?: Record<string, any>) {
  return request<API.SimpleResult>(`/api/settings/advanced/ansible-logs`, {
    method: 'DELETE',
    ...{},
    ...(options || {}),
  });
}

export async function deleteContainerStats(options?: Record<string, any>) {
  return request<API.SimpleResult>(`/api/settings/advanced/container-stats`, {
    method: 'DELETE',
    ...{},
    ...(options || {}),
  });
}

export async function deleteDeviceStats(options?: Record<string, any>) {
  return request<API.SimpleResult>(`/api/settings/advanced/device-stats`, {
    method: 'DELETE',
    ...{},
    ...(options || {}),
  });
}

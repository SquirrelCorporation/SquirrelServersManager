// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

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
  masterNodeUrl?: string,
  options?: { [key: string]: any },
) {
  return request<API.NewDevice>('/api/devices', {
    data: { ip: ip, masterNodeUrl: masterNodeUrl, ...deviceAuth },
    method: 'PUT',
    ...(options || {}),
  });
}

export async function deleteDevice(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`/api/devices/${uuid}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function updateDeviceDockerWatcher(
  uuid: string,
  dockerOptions: {
    dockerWatcher: boolean;
    dockerStatsWatcher: boolean;
    dockerEventsWatcher: boolean;
    dockerWatcherCron?: string;
    dockerStatsCron?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`/api/devices/${uuid}/docker-watcher`, {
    method: 'POST',
    data: {
      ...dockerOptions,
    },
    ...(options || {}),
  });
}

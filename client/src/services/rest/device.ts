// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API, SsmAgent } from 'ssm-shared-lib';

export async function getDevices(
  params?: API.PageParams,
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

export async function getAllDevices(
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.DeviceList>('/api/devices/all', {
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
  unManaged?: boolean,
  masterNodeUrl?: string,
  options?: { [key: string]: any },
) {
  return request<API.NewDevice>('/api/devices', {
    data: {
      ip: ip,
      masterNodeUrl: masterNodeUrl,
      unManaged: unManaged,
      ...deviceAuth,
    },
    method: 'PUT',
    ...(options || {}),
  });
}

export async function postCheckAnsibleConnection(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  masterNodeUrl?: string,
  options?: { [key: string]: any },
) {
  return request<API.NewDevice>('/api/devices/check-connection/ansible', {
    data: { ip: ip, masterNodeUrl: masterNodeUrl, ...deviceAuth },
    method: 'POST',
    ...(options || {}),
  });
}

export async function postCheckDockerConnection(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.NewDevice>('/api/devices/check-connection/docker', {
    data: { ip: ip, ...deviceAuth },
    method: 'POST',
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
    dockerStatsWatcher?: boolean;
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

export async function getCheckDeviceDockerConnection(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(
    `/api/devices/${uuid}/check-connection/docker`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function getCheckDeviceAnsibleConnection(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(
    `/api/devices/${uuid}/check-connection/ansible`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

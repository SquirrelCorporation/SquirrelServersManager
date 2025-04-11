// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/device-credentials';

export async function getDeviceAuth(
  deviceId: string,
  options?: { [key: string]: any },
) {
  return request<API.DeviceAuthResponse>(`${BASE_URL}/${deviceId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateDeviceAuth(
  deviceId: string,
  data: API.DeviceAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`${BASE_URL}/${deviceId}`, {
    method: 'PATCH',
    data: data,
    ...(options || {}),
  });
}

export async function updateDeviceDockerAuth(
  deviceId: string,
  data: API.DeviceDockerAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`${BASE_URL}/${deviceId}/docker`, {
    method: 'PATCH',
    data: data,
    ...(options || {}),
  });
}

export async function updateDeviceProxmoxAuth(
  deviceId: string,
  data: API.ProxmoxAuth,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`${BASE_URL}/${deviceId}/proxmox`, {
    method: 'PATCH',
    data: data,
    ...(options || {}),
  });
}

export async function postCheckDeviceProxmoxAuth(
  deviceId: string,
  data: API.ProxmoxAuth,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(
    `${BASE_URL}/${deviceId}/proxmox/test-connection`,
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
}

export async function deleteDockerCert(
  deviceId: string,
  type: 'ca' | 'cert' | 'key',
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`${BASE_URL}/${deviceId}/upload/${type}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

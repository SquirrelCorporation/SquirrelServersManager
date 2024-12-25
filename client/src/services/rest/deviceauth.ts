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
  return request<API.SimpleResult>(`/api/devices/${deviceId}/auth`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function putDeviceDockerAuth(
  deviceId: string,
  data: API.DeviceDockerAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`/api/devices/${deviceId}/auth/docker`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function postDeviceProxmoxAuth(
  deviceId: string,
  data: API.ProxmoxAuth,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`/api/devices/${deviceId}/auth/proxmox`, {
    method: 'POST',
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
    `/api/devices/${deviceId}/auth/proxmox/test-connection`,
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
  return request<API.SimpleResult>(
    `/api/devices/${deviceId}/auth/upload/${type}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

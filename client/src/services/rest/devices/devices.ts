// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API, SsmAgent } from 'ssm-shared-lib';

const BASE_URL = '/api/devices';

export async function getDevices(
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.DeviceList>(`${BASE_URL}`, {
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
  return request<API.DeviceList>(`${BASE_URL}/all`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createDevice(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  unManaged?: boolean,
  masterNodeUrl?: string,
  installMethod?: SsmAgent.InstallMethods,
  options?: { [key: string]: any },
) {
  return request<API.NewDevice>(`${BASE_URL}`, {
    data: {
      ip: ip,
      masterNodeUrl: masterNodeUrl,
      unManaged: unManaged,
      ...deviceAuth,
      installMethod,
    },
    method: 'POST',
    ...(options || {}),
  });
}

export async function postCheckAnsibleConnection(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  masterNodeUrl?: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckAnsibleConnection>>(
    `${BASE_URL}/check-connection/ansible`,
    {
      data: { ip: ip, masterNodeUrl: masterNodeUrl, ...deviceAuth },
      method: 'POST',
      ...(options || {}),
    },
  );
}

export async function postCheckDockerConnection(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckDockerConnection>>(
    `${BASE_URL}/check-connection/docker`,
    {
      data: { ip: ip, ...deviceAuth },
      method: 'POST',
      ...(options || {}),
    },
  );
}

export async function postCheckRemoteSystemInformationConnection(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckRemoteSystemInformationConnection>>(
    `${BASE_URL}/check-connection/remote-system-information`,
    {
      data: { ip: ip, ...deviceAuth },
      method: 'POST',
      ...(options || {}),
    },
  );
}

export async function deleteDevice(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.SimpleResult>>(`${BASE_URL}/${uuid}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function updateDeviceDockerConfiguration(
  uuid: string,
  dockerOptions: {
    dockerWatcher: boolean;
    dockerStatsWatcher?: boolean;
    dockerEventsWatcher: boolean;
    dockerWatcherCron?: string;
    dockerStatsCron?: string;
    dockerWatchAll?: boolean;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<API.SimpleResult>>(
    `${BASE_URL}/${uuid}/configuration/containers/docker`,
    {
      method: 'PATCH',
      data: {
        ...dockerOptions,
      },
      ...(options || {}),
    },
  );
}

export async function updateDeviceSystemInformationConfiguration(
  uuid: string,
  systemInformationConfiguration: Partial<API.SystemInformationConfiguration>,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.SimpleResult>>(
    `${BASE_URL}/${uuid}/configuration/system-information`,
    {
      method: 'PATCH',
      data: {
        systemInformationConfiguration: { ...systemInformationConfiguration },
      },
      ...(options || {}),
    },
  );
}

export async function updateDeviceProxmoxConfiguration(
  uuid: string,
  proxmoxConfiguration: API.ProxmoxConfiguration,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.SimpleResult>>(
    `${BASE_URL}/${uuid}/configuration/containers/proxmox`,
    {
      method: 'PATCH',
      data: proxmoxConfiguration,
      ...(options || {}),
    },
  );
}

export async function updateAgentInstallMethod(
  uuid: string,
  installMethod: SsmAgent.InstallMethods,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(`${BASE_URL}/${uuid}/agent-install-method`, {
    method: 'PATCH',
    data: {
      installMethod,
    },
    ...(options || {}),
  });
}

export async function postDeviceCapabilities(
  uuid: string,
  capabilities: API.DeviceCapabilities,
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.DeviceList>(`${BASE_URL}/${uuid}/capabilities`, {
    method: 'PATCH',
    data: { capabilities },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

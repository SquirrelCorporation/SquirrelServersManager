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
  installMethod?: SsmAgent.InstallMethods,
  options?: { [key: string]: any },
) {
  return request<API.NewDevice>('/api/devices', {
    data: {
      ip: ip,
      masterNodeUrl: masterNodeUrl,
      unManaged: unManaged,
      ...deviceAuth,
      installMethod,
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
  return request<API.Response<API.CheckAnsibleConnection>>(
    '/api/devices/check-connection/ansible',
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
    '/api/devices/check-connection/docker',
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
    '/api/devices/check-connection/remote-system-information',
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
  return request<API.Response<API.SimpleResult>>(`/api/devices/${uuid}`, {
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
    `/api/devices/${uuid}/configuration/containers/docker`,
    {
      method: 'POST',
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
    `/api/devices/${uuid}/configuration/system-information`,
    {
      method: 'POST',
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
    `/api/devices/${uuid}/configuration/containers/proxmox`,
    {
      method: 'POST',
      data: proxmoxConfiguration,
      ...(options || {}),
    },
  );
}

export async function getCheckDeviceDockerConnection(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckDockerConnection>>(
    `/api/devices/${uuid}/auth/docker/test-connection`,
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
  return request<API.Response<API.CheckAnsibleConnection>>(
    `/api/devices/${uuid}/auth/ansible/test-connection`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function getCheckDeviceRemoteSystemInformationConnection(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckRemoteSystemInformationConnection>>(
    `/api/devices/${uuid}/auth/remote-system-information/test-connection`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function updateAgentInstallMethod(
  uuid: string,
  installMethod: SsmAgent.InstallMethods,
  options?: { [key: string]: any },
) {
  return request<API.SimpleResult>(
    `/api/devices/${uuid}/agent-install-method`,
    {
      method: 'POST',
      data: {
        installMethod,
      },
      ...(options || {}),
    },
  );
}

export async function postDeviceDiagnostic(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.SimpleResult>>(
    `/api/devices/${uuid}/auth/diagnostic`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

export async function postDeviceCapabilities(
  uuid: string,
  capabilities: API.DeviceCapabilities,
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.DeviceList>(`/api/devices/${uuid}/capabilities`, {
    method: 'POST',
    data: { capabilities },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

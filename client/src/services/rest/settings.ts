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

export async function deletePlaybooksAndResync(options?: Record<string, any>) {
  return request<API.SimpleResult>(
    `/api/settings/advanced/playbooks-and-resync`,
    {
      method: 'DELETE',
      ...{},
      ...(options || {}),
    },
  );
}

export async function postDeviceStatsSettings(
  type: string,
  value: number,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/settings/device-stats/${type}`, {
    method: 'POST',
    ...{},
    data: { value: value },
    ...(options || {}),
  });
}

export async function postMasterNodeUrlValue(
  value: string,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/settings/keys/master-node-url`, {
    method: 'POST',
    ...{},
    data: { value: value },
    ...(options || {}),
  });
}

export async function getMongoDBServerStats(options?: Record<string, any>) {
  return request<API.Response<API.MongoDBServerStats>>(
    `/api/settings/information/mongodb`,
    {
      method: 'GET',
      ...{},
      ...(options || {}),
    },
  );
}

export async function getRedisServerStats(options?: Record<string, any>) {
  return request<API.Response<API.RedisServerStats>>(
    `/api/settings/information/redis`,
    {
      method: 'GET',
      ...{},
      ...(options || {}),
    },
  );
}

export async function getPrometheusServerStats(options?: Record<string, any>) {
  return request<API.Response<API.PrometheusServerStats>>(
    `/api/settings/information/prometheus`,
    {
      method: 'GET',
      ...{},
      ...(options || {}),
    },
  );
}

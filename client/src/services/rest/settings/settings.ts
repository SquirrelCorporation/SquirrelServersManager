import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/settings';

export async function postLogsSetting(
  type: string,
  value: number,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/logs/${type}`, {
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
  return request<API.SimpleResult>(`${BASE_URL}/devices/${type}`, {
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
  return request<API.SimpleResult>(`${BASE_URL}/dashboard/${type}`, {
    method: 'POST',
    ...{},
    data: { value: value },
    ...(options || {}),
  });
}

export async function postResetSettings(options?: Record<string, any>) {
  return request<API.SimpleResult>(`${BASE_URL}/reset`, {
    method: 'POST',
    ...{},
    ...(options || {}),
  });
}

export async function postRestartServer(options?: Record<string, any>) {
  return request<API.SimpleResult>(`${BASE_URL}/advanced/restart`, {
    method: 'POST',
    ...{},
    ...(options || {}),
  });
}

export async function deleteServerLogs(options?: Record<string, any>) {
  return request<API.SimpleResult>(`${BASE_URL}/advanced/logs`, {
    method: 'DELETE',
    ...{},
    ...(options || {}),
  });
}

export async function deleteAnsibleLogs(options?: Record<string, any>) {
  return request<API.SimpleResult>(`${BASE_URL}/advanced/ansible-logs`, {
    method: 'DELETE',
    ...{},
    ...(options || {}),
  });
}

export async function deletePlaybooksAndResync(options?: Record<string, any>) {
  return request<API.SimpleResult>(
    `${BASE_URL}/advanced/playbooks-and-resync`,
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
  return request<API.SimpleResult>(`${BASE_URL}/device-stats/${type}`, {
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
  return request<API.SimpleResult>(`${BASE_URL}/keys/master-node-url`, {
    method: 'POST',
    ...{},
    data: { value: value },
    ...(options || {}),
  });
}

export async function getMongoDBServerStats(options?: Record<string, any>) {
  return request<API.Response<API.MongoDBServerStats>>(
    `${BASE_URL}/information/mongodb`,
    {
      method: 'GET',
      ...{},
      ...(options || {}),
    },
  );
}

export async function getRedisServerStats(options?: Record<string, any>) {
  return request<API.Response<API.RedisServerStats>>(
    `${BASE_URL}/information/redis`,
    {
      method: 'GET',
      ...{},
      ...(options || {}),
    },
  );
}

export async function getPrometheusServerStats(options?: Record<string, any>) {
  return request<API.Response<API.PrometheusServerStats>>(
    `${BASE_URL}/information/prometheus`,
    {
      method: 'GET',
      ...{},
      ...(options || {}),
    },
  );
}

import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getTasksLogs(
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.Tasks>(`/api/logs/tasks`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getServerLogs(
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.ServerLog[]>>(`/api/logs/server`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

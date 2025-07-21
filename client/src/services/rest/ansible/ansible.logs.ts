import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const API_URL = '/api/ansible/logs';

export async function getTasksLogs(
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.Task[]>>(`${API_URL}/tasks`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getTaskEventsLogs(
  id: string,
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.TaskEvent[]>>(`${API_URL}/tasks/${id}/logs`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
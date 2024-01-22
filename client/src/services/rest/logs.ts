import { request } from '@umijs/max';

export async function getTasksLogs() {
  return request<API.Tasks>(`/api/logs/tasks`, {
    method: 'GET',
    ...{},
  });
}

export async function getServerLogs() {
  return request<API.ServerLogs>(`/api/logs/server`, {
    method: 'GET',
    ...{},
  });
}

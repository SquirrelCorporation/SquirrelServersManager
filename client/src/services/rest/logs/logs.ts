import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/logs';

export async function getServerLogs(
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.ServerLog[]>>(`${BASE_URL}/server`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

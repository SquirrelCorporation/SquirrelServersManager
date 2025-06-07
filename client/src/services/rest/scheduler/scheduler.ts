import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/scheduler';

export async function getCrons(options?: Record<string, any>) {
  return request<API.Cron>(`${BASE_URL}`, {
    method: 'GET',
    ...(options || {}),
  });
}

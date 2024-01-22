import { request } from '@umijs/max';

export async function getCrons(options?: { [key: string]: any }) {
  return request<API.Cron>('/api/admin/crons', {
    method: 'GET',
    ...(options || {}),
  });
}

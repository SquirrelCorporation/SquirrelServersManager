import { request } from '@umijs/max';

export async function getCrons(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/api/admin/crons', {
    method: 'GET',
    ...(options || {}),
  });
}

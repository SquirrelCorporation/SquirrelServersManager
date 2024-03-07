import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getCrons(options?: Record<string, any>) {
  return request<API.Cron>('/api/admin/crons', {
    method: 'GET',
    ...(options || {}),
  });
}

import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/notifications';

export async function getAllNotifications(
  params?: API.PageParams,
  options?: Record<string, any>,
) {
  return request<API.Response<API.InAppNotification[]>>(`${BASE_URL}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function markAsAllSeen(
  params?: API.PageParams,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/mark-seen`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

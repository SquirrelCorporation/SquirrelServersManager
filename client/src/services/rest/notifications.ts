import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getAllNotifications(
  params?: API.PageParams,
  options?: Record<string, any>,
) {
  return request<API.Response<API.InAppNotification[]>>(`/api/notifications`, {
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
  return request<API.SimpleResult>(`/api/notifications`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

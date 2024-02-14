import { request } from '@umijs/max';

export async function currentUser(options?: Record<string, any>) {
  return request<API.CurrentUser>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function hasUser(options?: Record<string, any>) {
  return request<API.HasUsers>('/api/hasUsers', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>('/api/createFirstUser', {
    method: 'POST',
    data: { name: name, email: email, password: password },
    ...(options || {}),
  });
}

export async function getNotices(options?: Record<string, any>) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

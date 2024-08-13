// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function user(
  body: API.LoginParams,
  options?: { [key: string]: any },
) {
  return request<API.LoginResult>('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/users/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function currentUser(options?: Record<string, any>) {
  return request<API.Response<API.CurrentUser>>('/api/users/current', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function hasUser(options?: Record<string, any>) {
  return request<API.HasUsers>('/api/users', {
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
  return request<API.SimpleResult>('/api/users', {
    method: 'POST',
    data: { name: name, email: email, password: password },
    ...(options || {}),
  });
}

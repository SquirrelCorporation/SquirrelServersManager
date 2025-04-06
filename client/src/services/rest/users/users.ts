// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/users';

export async function user(
  body: API.LoginParams,
  options?: { [key: string]: any },
) {
  return request<API.LoginResult>(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>(`${BASE_URL}/logout`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function currentUser(options?: Record<string, any>) {
  return request<API.Response<API.CurrentUser>>(`${BASE_URL}/current`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function hasUser(options?: Record<string, any>) {
  return request<API.HasUsers>(`${BASE_URL}`, {
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
  return request<API.SimpleResult>(`${BASE_URL}`, {
    method: 'POST',
    data: { name: name, email: email, password: password },
    ...(options || {}),
  });
}

export async function postResetApiKey() {
  return request<API.UserSettingsResetApiKey>(`${BASE_URL}/api-key`, {
    method: 'PUT',
    ...{},
  });
}

export async function postUserLogs(body: API.UserLogsLevel) {
  return request<API.SimpleResult>(`${BASE_URL}/logs-level`, {
    method: 'POST',
    data: body,
    ...{},
  });
}

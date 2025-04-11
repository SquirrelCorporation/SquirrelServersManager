import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/ansible-config';

export async function getAnsibleConfig(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.AnsibleConfig>> {
  return request<API.Response<API.AnsibleConfig>>(`${BASE_URL}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postAnsibleConfig(
  data: {
    section: string;
    key: string;
    value: string;
    deactivated: boolean;
    description: string;
  },
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.SimpleResult>>(`${BASE_URL}`, {
    data,
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}


export async function putAnsibleConfig(
  data: {
    section: string;
    key: string;
    value: string;
    deactivated: boolean;
    description: string;
  },
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.SimpleResult>>(`${BASE_URL}`, {
    data,
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function deleteAnsibleConfig(
  data: { section: string; key: string },
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.SimpleResult>>(`${BASE_URL}`, {
    data,
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
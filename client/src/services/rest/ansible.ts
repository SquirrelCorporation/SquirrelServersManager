import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getAnsibleConfig(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.AnsibleConfig>> {
  return request<API.Response<API.AnsibleConfig>>('/api/ansible/config', {
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
  return request<API.Response<API.SimpleResult>>('/api/ansible/config', {
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
  return request<API.Response<API.SimpleResult>>('/api/ansible/config', {
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
  return request<API.Response<API.SimpleResult>>('/api/ansible/config', {
    data,
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

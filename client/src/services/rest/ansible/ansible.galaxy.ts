import { request } from '@umijs/max';
import { API, SsmAnsible } from 'ssm-shared-lib';

const BASE_URL = '/api/ansible/galaxy';

export async function getCollections(
  params?: any,
  options?: Record<string, any>,
) {
  return request<any>(`${BASE_URL}/collections`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getCollection(
  params: { name: string; namespace: string; version: string },
  options?: Record<string, any>,
) {
  return request<any>(`${BASE_URL}/collections/details`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postInstallCollection(
  body: { name: string; namespace: string },
  params?: any,
  options?: Record<string, any>,
) {
  return request<any>(`${BASE_URL}/collections/install`, {
    method: 'POST',
    data: body,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

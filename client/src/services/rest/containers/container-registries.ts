import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib'; 

const BASE_URL = '/api/container-registries';   

/*
  Container Registries
*/
export async function getRegistries(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainerRegistryResponse>(`${BASE_URL}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateRegistry(
  name: string,
  auth: any,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/${name}`, {
    method: 'POST',
    data: { auth: auth },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function resetRegistry(
  name: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/${name}`, {
    method: 'PATCH',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function removeRegistry(
  name: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/${name}`, {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createCustomRegistry(
  name: string,
  auth: any,
  authScheme: any,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/${name}`, {
    method: 'PUT',
    data: { auth: auth, authScheme: authScheme },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

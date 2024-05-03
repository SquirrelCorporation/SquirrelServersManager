import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';
import { ContainersResponse } from 'ssm-shared-lib/distribution/types/api';

export async function getContainers(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainersResponse>('/api/containers', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getRegistries(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainerRegistryResponse>('/api/containers/registries', {
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
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
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
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
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
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
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
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
    method: 'PUT',
    data: { auth: auth, authScheme: authScheme },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateContainerCustomName(
  customName: string,
  containerId: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/containers/${containerId}/name`, {
    method: 'POST',
    data: { customName: customName },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

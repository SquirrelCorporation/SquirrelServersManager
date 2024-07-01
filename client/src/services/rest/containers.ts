import { request } from '@umijs/max';
import { API, SsmContainer } from 'ssm-shared-lib';

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

export async function postRefreshAll(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainersResponse>('/api/containers/refresh-all', {
    method: 'POST',
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

export async function getContainerStat(
  containerId: string,
  type: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleDeviceStat>(
    `/api/containers/${containerId}/stat/${type}`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postContainerAction(
  containerId: string,
  action: SsmContainer.Actions,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<any>> {
  return request<API.Response<any>>(
    `/api/containers/${containerId}/action/${action}`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

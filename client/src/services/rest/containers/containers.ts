import { request } from '@umijs/max';
import { API, SsmContainer } from 'ssm-shared-lib';

const BASE_URL = '/api/containers';

export async function getContainers(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainersResponse>(`${BASE_URL}`, {
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
  return request<API.ContainersResponse>(`${BASE_URL}/refresh-all`, {
    method: 'POST',
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
  return request<API.SimpleResult>(`${BASE_URL}/${containerId}/name`, {
    method: 'POST',
    data: { customName: customName },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postDockerContainerAction(
  containerId: string,
  action: SsmContainer.Actions,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<any>> {
  return request<API.Response<any>>(
    `${BASE_URL}/${containerId}/docker/actions/${action}`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postProxmoxContainerAction(
  containerId: string,
  action: SsmContainer.Actions,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<any>> {
  return request<API.Response<any>>(
    `${BASE_URL}/${containerId}/proxmox/actions/${action}`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

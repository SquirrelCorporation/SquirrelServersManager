import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/container-networks';

export async function getNetworks(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerNetwork[]>> {
  return request<API.Response<API.ContainerNetwork[]>>(
    `${BASE_URL}`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postNetwork(
  data: API.CreateNetwork,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerNetwork[]>> {
  return request<API.Response<API.ContainerNetwork[]>>(
    `${BASE_URL}`,
    {
      method: 'POST',
      data,
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/container-statistics';

export async function getContainerStats(
  containerId: string,
  type: string,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerStat[]>> {
  return request<API.Response<API.ContainerStat[]>>(
    `${BASE_URL}/${containerId}/stats/${type}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}


export async function getContainerStat(
  containerId: string,
  type: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.SimpleDeviceStat>> {
  return request<API.Response<API.SimpleDeviceStat>>(
    `${BASE_URL}/${containerId}/stat/${type}`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getNbContainersByStatus(
  status: string,
  options?: Record<string, any>,
): Promise<API.Response<number>> {
  return request<API.Response<number>>(
    `${BASE_URL}/count/${status}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function getAveragedStats(
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerAveragedStats>> {
  return request<API.Response<API.ContainerAveragedStats>>(
    `${BASE_URL}/averaged`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getContainerStats(
  containerId: string,
  type: string,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerStat[]>> {
  return request<API.Response<API.ContainerStat[]>>(
    `/api/containers/${containerId}/stats/${type}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

export async function getNbContainersByStatus(
  status: string,
  options?: Record<string, any>,
): Promise<API.Response<number>> {
  return request<API.Response<number>>(
    `/api/containers/stats/count/${status}`,
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
    `/api/containers/stats/averaged`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

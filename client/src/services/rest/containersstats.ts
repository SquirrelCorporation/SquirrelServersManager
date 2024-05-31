import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';
import { ContainerAveragedStats } from 'ssm-shared-lib/distribution/types/api';

export async function getContainerStats(
  containerId: string,
  type: string,
  options?: Record<string, any>,
) {
  return request<API.ContainerStats>(
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
) {
  return request<API.ContainerStats>(`/api/containers/stats/count/${status}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getAveragedStats(options?: Record<string, any>) {
  return request<API.ContainerAveragedStats>(`/api/containers/stats/averaged`, {
    method: 'GET',
    ...(options || {}),
  });
}

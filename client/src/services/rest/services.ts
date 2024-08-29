import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getTemplates(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.Template[]>> {
  return request<API.Response<API.Template[]>>('/api/containers/templates', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getNetworks(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerNetwork[]>> {
  return request<API.Response<API.ContainerNetwork[]>>(
    '/api/containers/networks',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getVolumes(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerVolume[]>> {
  return request<API.Response<API.ContainerVolume[]>>(
    '/api/containers/volumes',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getImages(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerImage[]>> {
  return request<API.Response<API.ContainerImage[]>>('/api/containers/images', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postDeploy(
  template: API.Targets & API.Template,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ExecId>> {
  return request<API.Response<API.ExecId>>('/api/containers/deploy', {
    method: 'POST',
    data: { template: template },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

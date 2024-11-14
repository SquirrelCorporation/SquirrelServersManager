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

export async function postNetwork(
  data: API.CreateNetwork,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerNetwork[]>> {
  return request<API.Response<API.ContainerNetwork[]>>(
    '/api/containers/networks',
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

export async function postVolume(
  data: API.CreateVolume,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerNetwork[]>> {
  return request<API.Response<API.ContainerNetwork[]>>(
    '/api/containers/volumes',
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

export async function postBackUpVolume(
  uuid: string,
  mode: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.BackupVolumeResponse>> {
  return request<API.Response<API.BackupVolumeResponse>>(
    `/api/containers/volumes/backup/${uuid}`,
    {
      method: 'POST',
      data: { mode },
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getBackUpVolume(
  params?: { fileName: string },
  options?: Record<string, any>,
) {
  return request<any>(`/api/containers/volumes/backup`, {
    method: 'GET',
    responseType: 'blob',
    parseResponse: false,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

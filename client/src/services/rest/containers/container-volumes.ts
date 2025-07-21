import { API, SsmContainer } from "ssm-shared-lib";
import { request } from '@umijs/max';


const BASE_URL = '/api/container-volumes';

export async function getVolumes(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerVolume[]>> {
  return request<API.Response<API.ContainerVolume[]>>(
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

export async function postVolume(
  data: API.CreateVolume,
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


export async function postBackUpVolume(
  uuid: string,
  mode: SsmContainer.VolumeBackupMode,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.BackupVolumeResponse>> {
  return request<API.Response<API.BackupVolumeResponse>>(
    `${BASE_URL}/backup/${uuid}`,
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
  return request<any>(`${BASE_URL}/backup`, {
    method: 'GET',
    responseType: 'blob',
    parseResponse: false,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/ansible-vaults';

export async function getAnsibleVaults(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.AnsibleVault[]>> {
  return request<API.Response<API.AnsibleVault[]>>(`${BASE_URL}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postAnsibleVault(
  data: API.AnsibleVault,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.SimpleResult>> {
  return request<API.Response<API.SimpleResult>>(`${BASE_URL}`, {
    method: 'POST',
    data,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateAnsibleVault(
  data: API.AnsibleVault,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.SimpleResult>> {
  return request<API.Response<API.SimpleResult>>(
    `${BASE_URL}/${data.vaultId}`,
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

export async function deleteAnsibleVault(
  vaultId: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.SimpleResult>> {
  return request<API.Response<API.SimpleResult>>(
    `${BASE_URL}/${vaultId}`,
    {
      method: 'DELETE',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

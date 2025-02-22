import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getAnsibleConfig(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.AnsibleConfig>> {
  return request<API.Response<API.AnsibleConfig>>('/api/ansible/config', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postAnsibleConfig(
  data: {
    section: string;
    key: string;
    value: string;
    deactivated: boolean;
    description: string;
  },
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.SimpleResult>>('/api/ansible/config', {
    data,
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putAnsibleConfig(
  data: {
    section: string;
    key: string;
    value: string;
    deactivated: boolean;
    description: string;
  },
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.SimpleResult>>('/api/ansible/config', {
    data,
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function deleteAnsibleConfig(
  data: { section: string; key: string },
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.SimpleResult>>('/api/ansible/config', {
    data,
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getAnsibleSmartFailure(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.SmartFailure>> {
  return request<API.Response<API.SmartFailure>>(`/api/ansible/smart-failure`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getAnsibleVaults(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.AnsibleVault[]>> {
  return request<API.Response<API.AnsibleVault[]>>(`/api/ansible/vaults`, {
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
  return request<API.Response<API.SimpleResult>>(`/api/ansible/vaults`, {
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
    `/api/ansible/vaults/${data.vaultId}`,
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
    `/api/ansible/vaults/${vaultId}`,
    {
      method: 'DELETE',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

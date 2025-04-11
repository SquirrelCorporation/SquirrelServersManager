import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/playbooks/repositories';

export async function getPlaybooksRepositories(): Promise<
  API.Response<API.PlaybooksRepository[]>
> {
  return request<API.Response<API.PlaybooksRepository[]>>(`${BASE_URL}/`, {
    method: 'GET',
    ...{},
  });
}

export async function getGitPlaybooksRepositories(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.GitPlaybooksRepository[]>>(
    `${BASE_URL}/git/`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getPlaybooksLocalRepositories(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.GitPlaybooksRepository[]>>(
    `${BASE_URL}/local/`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postPlaybooksLocalRepositories(
  repositoryUuid: string,
  repository: Partial<API.LocalPlaybooksRepository>,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.LocalPlaybooksRepository>>(
    `${BASE_URL}/local/${repositoryUuid}`,
    {
      data: { ...repository },
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function putPlaybooksLocalRepositories(
  repository: API.LocalPlaybooksRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.LocalPlaybooksRepository>>(
    `${BASE_URL}/local/`,
    {
      data: { ...repository },
      method: 'PUT',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function deletePlaybooksLocalRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/local/${uuid}`, {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function syncToDatabasePlaybooksLocalRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `${BASE_URL}/local/${uuid}/sync-to-database`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postPlaybooksGitRepository(
  repositoryUuid: string,
  repository: API.GitPlaybooksRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/${repositoryUuid}`, {
    data: { ...repository },
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putPlaybooksGitRepository(
  repository: API.GitPlaybooksRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/`, {
    data: { ...repository },
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function deletePlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/${uuid}`, {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function syncToDatabasePlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/${uuid}/sync-to-database`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function forcePullPlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/${uuid}/force-pull`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function forceClonePlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/${uuid}/force-clone`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function commitAndSyncPlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/${uuid}/commit-and-sync`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function forceRegisterPlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`${BASE_URL}/git/${uuid}/force-register`, {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createEmptyPlaybookInRepository(
  playbooksRepositoryUuid: string,
  playbookName: string,
  fullPath: string,
) {
  return request<API.Response<API.PlaybookFile>>(
    `${BASE_URL}/${playbooksRepositoryUuid}/playbook/${playbookName}/`,
    {
      method: 'POST',
      data: { fullPath: fullPath },
      ...{},
    },
  );
}

export async function createDirectoryInRepository(
  playbooksRepositoryUuid: string,
  directoryName: string,
  fullPath: string,
) {
  return request<API.SimpleResult>(
    `${BASE_URL}/${playbooksRepositoryUuid}/directory/${directoryName}/`,
    {
      method: 'POST',
      data: { fullPath: fullPath },
      ...{},
    },
  );
}

export async function deleteAnyInRepository(
  playbooksRepositoryUuid: string,
  fullPath: string,
) {
  return request<API.SimpleResult>(`${BASE_URL}/${playbooksRepositoryUuid}`, {
    method: 'DELETE',
    data: { fullPath: fullPath },
    ...{},
  });
}

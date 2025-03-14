import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getPlaybooksRepositories(): Promise<
  API.Response<API.PlaybooksRepository[]>
> {
  return request<API.Response<API.PlaybooksRepository[]>>(
    '/api/playbooks-repository/',
    {
      method: 'GET',
      ...{},
    },
  );
}

export async function getGitPlaybooksRepositories(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.GitPlaybooksRepository[]>>(
    `/api/playbooks-repository/git/`,
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
    `/api/playbooks-repository/local/`,
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
    `/api/playbooks-repository/local/${repositoryUuid}`,
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
    `/api/playbooks-repository/local/`,
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
  return request<API.SimpleResult>(`/api/playbooks-repository/local/${uuid}`, {
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
    `/api/playbooks-repository/local/${uuid}/sync-to-database`,
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
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${repositoryUuid}`,
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

export async function putPlaybooksGitRepository(
  repository: API.GitPlaybooksRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/playbooks-repository/git/`, {
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
  return request<API.SimpleResult>(`/api/playbooks-repository/git/${uuid}`, {
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
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/sync-to-database`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forcePullPlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/force-pull-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forceClonePlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/force-clone`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function commitAndSyncPlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/commit-and-sync`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forceRegisterPlaybooksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/force-register`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function createEmptyPlaybookInRepository(
  playbooksRepositoryUuid: string,
  playbookName: string,
  fullPath: string,
) {
  return request<API.Response<API.PlaybookFile>>(
    `/api/playbooks-repository/${playbooksRepositoryUuid}/playbook/${playbookName}/`,
    {
      method: 'PUT',
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
    `/api/playbooks-repository/${playbooksRepositoryUuid}/directory/${directoryName}/`,
    {
      method: 'PUT',
      data: { fullPath: fullPath },
      ...{},
    },
  );
}

export async function deleteAnyInRepository(
  playbooksRepositoryUuid: string,
  fullPath: string,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/${playbooksRepositoryUuid}`,
    {
      method: 'DELETE',
      data: { fullPath: fullPath },
      ...{},
    },
  );
}

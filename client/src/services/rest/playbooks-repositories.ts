import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getPlaybooksRepositories(): Promise<API.PlaybooksRepositories> {
  return request<API.Response<API.PlaybooksRepository[]>>(
    '/api/playbooks-repository/',
    {
      method: 'GET',
      ...{},
    },
  );
}

export async function getGitRepositories(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.GitRepository[]>>(
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

export async function getLocalRepositories(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.LocalRepository[]>>(
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

export async function postLocalRepositories(
  repository: Partial<API.LocalRepository>,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.LocalRepository>>(
    `/api/playbooks-repository/local/${repository.uuid}`,
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

export async function putLocalRepositories(
  repository: API.LocalRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.LocalRepository>>(
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

export async function deleteLocalRepository(
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

export async function syncToDatabaseLocalRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/local/${uuid}/sync-to-database-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postGitRepository(
  repository: API.GitRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${repository.uuid}`,
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

export async function putGitRepository(
  repository: API.GitRepository,
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

export async function deleteGitRepository(
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

export async function syncToDatabaseGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/sync-to-database-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forcePullGitRepository(
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

export async function forceCloneGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/force-clone-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function commitAndSyncGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/playbooks-repository/git/${uuid}/commit-and-sync-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forceRegisterGitRepository(
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

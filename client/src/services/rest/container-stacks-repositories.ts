import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getGitContainerStacksRepositories(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.GitContainerStacksRepository[]>>(
    `/api/container-repository/git/`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postContainerStacksGitRepository(
  repositoryUuid: string,
  repository: API.GitContainerStacksRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/container-repository/git/${repositoryUuid}`,
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

export async function putContainerStacksGitRepository(
  repository: API.GitContainerStacksRepository,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/container-repository/git/`, {
    data: { ...repository },
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function deleteContainerStacksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/container-repository/git/${uuid}`, {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function syncToDatabaseContainerStacksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/container-repository/git/${uuid}/sync-to-database-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forcePullContainerStacksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/container-repository/git/${uuid}/force-pull-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forceCloneContainerStacksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/container-repository/git/${uuid}/force-clone-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function commitAndSyncContainerStacksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/container-repository/git/${uuid}/commit-and-sync-repository`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function forceRegisterContainerStacksGitRepository(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(
    `/api/container-repository/git/${uuid}/force-register`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

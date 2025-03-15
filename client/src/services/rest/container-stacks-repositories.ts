import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const API_PATH = '/api/container-stacks/repositories';

export async function getGitContainerStacksRepositories(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.GitContainerStacksRepository[]>>(
    `${API_PATH}`,
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
    `${API_PATH}/${repositoryUuid}`,
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
  return request<API.SimpleResult>(`${API_PATH}`, {
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
  return request<API.SimpleResult>(`${API_PATH}/${uuid}`, {
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
    `${API_PATH}/${uuid}/sync-to-database`,
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
    `${API_PATH}/${uuid}/force-pull`,
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
    `${API_PATH}/${uuid}/force-clone`,
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
    `${API_PATH}/${uuid}/commit-and-sync`,
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
    `${API_PATH}/${uuid}/force-register`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

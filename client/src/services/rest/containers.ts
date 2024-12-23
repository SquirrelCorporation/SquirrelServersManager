import { request } from '@umijs/max';
import { API, SsmContainer } from 'ssm-shared-lib';

export async function getContainers(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainersResponse>('/api/containers', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postRefreshAll(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainersResponse>('/api/containers/refresh-all', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getRegistries(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.ContainerRegistryResponse>('/api/containers/registries', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateRegistry(
  name: string,
  auth: any,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
    method: 'POST',
    data: { auth: auth },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function resetRegistry(
  name: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
    method: 'PATCH',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function removeRegistry(
  name: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createCustomRegistry(
  name: string,
  auth: any,
  authScheme: any,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/containers/registries/${name}`, {
    method: 'PUT',
    data: { auth: auth, authScheme: authScheme },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateContainerCustomName(
  customName: string,
  containerId: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleResult>(`/api/containers/${containerId}/name`, {
    method: 'POST',
    data: { customName: customName },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getContainerStat(
  containerId: string,
  type: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.SimpleDeviceStat>(
    `/api/containers/${containerId}/stat/${type}`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postDockerContainerAction(
  containerId: string,
  action: SsmContainer.Actions,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<any>> {
  return request<API.Response<any>>(
    `/api/containers/${containerId}/docker/action/${action}`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postProxmoxContainerAction(
  containerId: string,
  action: SsmContainer.Actions,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<any>> {
  return request<API.Response<any>>(
    `/api/containers/${containerId}/proxmox/action/${action}`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postContainerCustomStack(
  name: string,
  json?: any,
  rawStackValue?: any,
  yaml?: string,
  lockJson?: boolean,
  icon?: string,
  iconColor?: string,
  iconBackgroundColor?: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerCustomStack>> {
  return request<API.Response<API.ContainerCustomStack>>(
    `/api/containers/custom-stacks/${name}`,
    {
      method: 'POST',
      data: {
        json,
        yaml,
        rawStackValue,
        lockJson,
        icon,
        iconColor,
        iconBackgroundColor,
      },
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function patchContainerCustomStack(
  uuid: string,
  json?: any,
  rawStackValue?: any,
  yaml?: string,
  lockJson?: boolean,
  icon?: string,
  iconColor?: string,
  iconBackgroundColor?: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerCustomStack>> {
  return request<API.Response<API.ContainerCustomStack>>(
    `/api/containers/custom-stacks/${uuid}`,
    {
      method: 'PATCH',
      data: {
        json,
        yaml,
        rawStackValue,
        lockJson,
        icon,
        iconColor,
        iconBackgroundColor,
      },
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postTransformContainerCustomStack(
  content: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerTransformCustomStack>> {
  return request<API.Response<API.ContainerTransformCustomStack>>(
    `/api/containers/custom-stacks/transform`,
    {
      method: 'POST',
      data: { content },
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getCustomStacks(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerCustomStack[]>> {
  return request<API.Response<API.ContainerCustomStack[]>>(
    `/api/containers/custom-stacks`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function deleteContainerCustomStack(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<any>> {
  return request<API.Response<API.ContainerCustomStack>>(
    `/api/containers/custom-stacks/${uuid}`,
    {
      method: 'DELETE',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postContainerCustomStackDryRun(
  json?: string,
  yaml?: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ContainerCustomStackValidation>> {
  return request<API.Response<API.ContainerCustomStackValidation>>(
    `/api/containers/custom-stacks/dry-run`,
    {
      method: 'POST',
      data: { json, yaml },
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function postDeployContainerCustomStack(
  uuid: string,
  target: string[],
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ExecId>> {
  return request<API.Response<API.ExecId>>(
    `/api/containers/custom-stacks/deploy/${uuid}`,
    {
      method: 'POST',
      data: { target },
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

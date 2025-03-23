import { request } from "@umijs/max";
import { API } from "ssm-shared-lib";

const API_PATH = '/api/container-stacks';

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
    `${API_PATH}/${name}`,
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
    `${API_PATH}/${uuid}`,
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
    `${API_PATH}/transform`,
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

export async function deleteContainerCustomStack(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<any>> {
  return request<API.Response<API.ContainerCustomStack>>(
    `${API_PATH}/${uuid}`,
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
    `${API_PATH}/dry-run`,
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
    `${API_PATH}/deploy/${uuid}`,
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
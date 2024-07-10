import { request } from '@umijs/max';
import { API, Automations } from 'ssm-shared-lib';

export async function getAutomations(
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.Automation[]>>('/api/automations', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putAutomation(
  name: string,
  rawChain: any,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.Automation>>(`/api/automations/${name}`, {
    method: 'PUT',
    data: { rawChain: rawChain },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function deleteAutomation(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.Automation>>(`/api/automations/${uuid}`, {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function executeAutomation(
  uuid: string,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<API.Automation>>(
    `/api/automations/${uuid}/execute`,
    {
      method: 'POST',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

export async function getTemplate(
  templateId: number,
  params?: any,
  options?: Record<string, any>,
) {
  return request<API.Response<Automations.AutomationChain>>(
    `/api/automations/template/${templateId}`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

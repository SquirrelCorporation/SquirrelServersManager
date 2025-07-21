import { request } from '@umijs/max';
import { API, SsmContainer } from 'ssm-shared-lib';

const BASE_URL = '/api/container-templates';

export async function getTemplates(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.Template[]>> {
  return request<API.Response<API.Template[]>>(`${BASE_URL}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}




export async function postDeploy(
  template: API.Targets & API.Template,
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.ExecId>> {
    return request<API.Response<API.ExecId>>(`${BASE_URL}/deploy`, {
    method: 'POST',
    data: { template: template },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const API_PATH = '/api/smart-failure';

export async function getAnsibleSmartFailure(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.SmartFailure>> {
  return request<API.Response<API.SmartFailure>>(`${API_PATH}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

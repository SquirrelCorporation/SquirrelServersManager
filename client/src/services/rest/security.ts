import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function getSecurityTestResults(
  params?: any,
  options?: Record<string, any>,
): Promise<API.Response<API.AnsibleConfig>> {
  return request<API.Response<API.AnsibleConfig>>('/api/security', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

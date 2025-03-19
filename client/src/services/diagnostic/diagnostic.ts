import { request } from '@umijs/max';
import { API, SsmAgent } from 'ssm-shared-lib';

const BASE_URL = '/api/diagnostic';

export async function postDeviceDiagnostic(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.SimpleResult>>(
    `${BASE_URL}/${uuid}`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}
 
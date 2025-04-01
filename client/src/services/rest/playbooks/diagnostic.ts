
import { request } from '@umijs/max';
import { API, SsmAnsible } from 'ssm-shared-lib';

const BASE_URL = '/api/playbooks/diagnostic';

export async function getCheckDeviceAnsibleConnection(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckAnsibleConnection>>(
    `${BASE_URL}/${uuid}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/remote-system-information/diagnostic';

export async function getCheckDeviceRemoteSystemInformationConnection(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckRemoteSystemInformationConnection>>(
    `${BASE_URL}/devices/${uuid}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
export async function postPreCheckRemoteSystemInformationConnection(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckRemoteSystemInformationConnection>>(
    `${BASE_URL}`,
    {
      data: { ip: ip, ...deviceAuth },
      method: 'POST',
      ...(options || {}),
    },
  );
}

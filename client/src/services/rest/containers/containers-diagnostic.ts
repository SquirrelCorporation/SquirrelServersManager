import { request } from "@umijs/max";
import { API } from "ssm-shared-lib";

const BASE_URL = '/api/containers/diagnostic';

export async function getCheckDeviceDockerConnection(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.CheckDockerConnection>>(
    `${BASE_URL}/devices/${uuid}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

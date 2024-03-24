import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

export async function postResetApiKey() {
  return request<API.UserSettingsResetApiKey>(
    `/api/users/settings/resetApiKey`,
    {
      method: 'POST',
      ...{},
    },
  );
}

export async function postUserLogs(body: API.UserLogsLevel) {
  return request<API.SimpleResult>(`/api/users/settings/logs`, {
    method: 'POST',
    data: body,
    ...{},
  });
}

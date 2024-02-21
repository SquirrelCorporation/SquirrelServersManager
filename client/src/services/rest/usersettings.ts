import { request } from '@umijs/max';

export async function postResetApiKey() {
  return request<API.UserSettingsResetApiKey>(
    `/api/user/settings/resetApiKey`,
    {
      method: 'POST',
      ...{},
    },
  );
}

export async function postUserLogs(body: API.UserLogsLevel) {
  return request<API.SimpleResult>(`/api/user/settings/logs`, {
    method: 'POST',
    data: body,
    ...{},
  });
}

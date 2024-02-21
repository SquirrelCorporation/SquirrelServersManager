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

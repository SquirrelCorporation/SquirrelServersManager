/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
import { API } from 'ssm-shared-lib';

export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
  };
}

import Footer from '@/components/Footer';
import {
  AvatarDropdown,
  AvatarName,
} from '@/components/HeaderComponents/AvatarDropdown';
import { DevicesHeaderWidget } from '@/components/HeaderComponents/DevicesHeaderWidget';
import DocumentationWidget from '@/components/HeaderComponents/DocumentationWidget';
import { HealthWidget } from '@/components/HeaderComponents/HealthWidget';
import NotificationsWidget from '@/components/HeaderComponents/NotificationsWidget';
import { currentUser as queryCurrentUser, hasUser } from '@/services/rest/user';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
// @ts-ignore
import { history, RunTimeLayoutConfig } from '@umijs/max';
import { API } from 'ssm-shared-lib';
import defaultSettings from '../config/defaultSettings';
import Logo from '../public/logo.svg';
import { errorConfig } from './requestErrorConfig';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const onboardingPath = '/user/onboarding';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  token?: string;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (error) {
      await hasUser()
        .then((e) => {
          if (e.data?.hasUsers) {
            history.push(loginPath);
          } else {
            history.push(onboardingPath);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
    return undefined;
  };

  // @ts-ignore
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout  https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  // @ts-ignore
  initialState,
  // @ts-ignore
  setInitialState,
}) => {
  return {
    logo: Logo,
    actionsRender: () => [
      <DocumentationWidget key="doc" />,
      <DevicesHeaderWidget key="online" />,
      <HealthWidget key="health" />,
      <NotificationsWidget key="notifications" />,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_: any, avatarChildren: any) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    menu: { type: 'group' },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // @ts-ignore
      const { location } = history;
      // login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [],
    links: [],
    menuHeaderRender: undefined,
    //  403
    // unAccessible: <div>unAccessible</div>,
    //  loading
    childrenRender: (children: any) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState: any) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};

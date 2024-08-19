import { outLogin } from '@/services/rest/user';
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useModel } from '@umijs/max';
import { Spin, Typography } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from './HeaderDropDown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const userName = useMemo(() => currentUser?.name, [currentUser?.name]);

  return (
    <Typography.Title
      level={5}
      className="anticon"
      style={{
        color: 'rgba(255, 255, 255, 0.65)',
        marginBottom: '0.9em',
        fontSize: '14px',
      }}
    >
      {userName}
    </Typography.Title>
  );
};

const Loading: React.FC<{ className: string }> = ({ className }) => (
  <span className={className}>
    <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
  </span>
);

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  menu,
  children,
}) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const actionClassName = useEmotionCss(({ token }) => ({
    display: 'flex',
    height: '48px',
    marginLeft: 'auto',
    overflow: 'hidden',
    alignItems: 'center',
    padding: '0 8px',
    cursor: 'pointer',
    borderRadius: token.borderRadius,
    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  }));

  const loginOut = async () => {
    await outLogin();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    const redirect = urlParams.get('redirect');

    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        // @ts-ignore
        search: stringify({ redirect: pathname + search }),
      });
    }
  };

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s: any) => ({
            ...s,
            currentUser: undefined,
            token: undefined,
          }));
        });
        loginOut();
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const menuItems = useMemo(
    () => [
      ...(menu
        ? [
            { key: 'center', icon: <UserOutlined />, label: '个人中心' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
            { type: 'divider' as const },
          ]
        : []),
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
    ],
    [menu],
  );

  const loadingComponent = <Loading className={actionClassName} />;

  if (
    !initialState ||
    !initialState.currentUser ||
    !initialState.currentUser.name
  ) {
    return loadingComponent;
  }

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};

/**
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/',
    name: 'Dashboard',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/manage',
    name: 'Manage',
    icon: 'crown',
    routes: [
      {
        name: 'Devices',
        icon: 'table',
        path: '/manage/devices',
        component: './Devices',
      },
      {
        name: 'Playbooks',
        icon: 'PlaySquareOutlined',
        path: '/manage/playbooks',
        component: './Playbooks',
      },
    ],
  },
  {
    path: '/admin',
    name: 'Configuration',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', component: './Admin/Inventory' },
      {
        name: 'Inventory',
        icon: 'database',
        path: '/admin/inventory',
        component: './Admin/Inventory',
      },
      {
        path: '/admin/crons',
        name: 'Crons',
        icon: 'interaction',
        component: './Admin/Crons',
      },
      {
        path: '/admin/logs',
        name: 'Logs',
        icon: 'UnorderedList',
        component: './Admin/Logs',
      },
      {
        path: '/admin/settings',
        name: 'Settings',
        icon: 'SettingOutlined',
        component: './Admin/Settings/GeneralSettings',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];

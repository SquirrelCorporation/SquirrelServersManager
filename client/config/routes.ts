export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { name: 'Login', path: '/user/login', component: './User/Login' },
      {
        name: 'FirstTime',
        path: '/user/onboarding',
        component: './User/FirstTime',
      },
    ],
  },
  {
    path: '/',
    name: 'Dashboard',
    icon: 'FundOutlined',
    component: './Welcome',
  },
  {
    path: '/manage',
    name: 'Manage',
    icon: 'GlobalOutlined',
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
      {
        name: 'Services',
        icon: 'AppstoreOutlined',
        path: '/manage/services',
        component: './Services',
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
        component: './Admin/Crons/Crons',
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
        component: './Admin/Settings/Settings',
      },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
  {
    path: '/admin/inventory/:id',
    component: './Admin/Inventory',
  },
  {
    path: '/manage/playbooks/:id',
    component: './Playbooks',
  },
];

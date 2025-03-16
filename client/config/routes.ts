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
    component: './Dashboard',
  },
  {
    path: '/manage',
    name: 'Manage',
    icon: 'GlobalOutlined',
    routes: [
      {
        path: '/manage',
        redirect: '/manage/devices',
      },
      {
        name: 'Devices',
        icon: 'table',
        path: '/manage/devices',
        component: './Devices',
      },
      {
        name: 'Containers',
        icon: 'AppstoreOutlined',
        path: '/manage/containers',
        component: './Containers',
      },
      {
        path: '/manage/automations',
        name: 'Automations',
        icon: 'interaction',
        component: './Automations/Automations',
      },
    ],
  },
  {
    path: '/stack',
    name: 'Stack',
    icon: 'BuildOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/stack',
        redirect: '/stack/playbooks',
      },
      {
        name: 'Playbooks',
        icon: 'PlaySquareOutlined',
        path: '/stack/playbooks',
        component: './Playbooks',
      },
      {
        name: 'Container Stacks',
        icon: 'ApartmentOutlined',
        path: '/stack/compose',
        component: './ComposeEditor',
      },
    ],
  },
  {
    path: '/plugins',
    name: 'Plugins',
    icon: 'AppstoreAddOutlined',
    component: './Plugins',
  },
  {
    path: '/admin',
    name: 'Configuration',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/inventory' },
      {
        name: 'Inventory',
        icon: 'database',
        path: '/admin/inventory',
        component: './Admin/Inventory',
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
  {
    path: '/manage/containers/logs/:id',
    component: './Containers/logs/Logs',
  },
  {
    path: '/manage/devices/ssh/:id',
    component: './Devices/DeviceSSHTerminal',
  },
];

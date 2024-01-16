import { MenuProps } from 'antd';
import {
  BugOutlined,
  DownloadOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ShakeOutlined,
  ThunderboltOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import React from 'react';

export const simpleMenuItems: MenuProps['items'] = [
  {
    label: (
      <>
        <PlayCircleOutlined /> Execute a playbook
      </>
    ),
    key: '-1',
  },
  {
    type: 'divider',
  },
  {
    label: (
      <>
        <ReloadOutlined /> Reboot
      </>
    ),
    key: '0',
  },
  {
    label: (
      <>
        <LoginOutlined /> Connect
      </>
    ),
    key: '1',
  },
  {
    type: 'divider',
  },
  {
    label: (
      <>
        <ShakeOutlined /> Ping
      </>
    ),
    key: '3',
  },
];

export const advancedMenuItems: MenuProps['items'] = [
  ...simpleMenuItems,
  {
    type: 'divider',
  },
  {
    label: (
      <>
        <ToTopOutlined /> Update Agent
      </>
    ),
    key: '5',
  },
  {
    label: (
      <>
        <DownloadOutlined /> Reinstall Agent
      </>
    ),
    key: '6',
  },
  {
    label: (
      <>
        <ThunderboltOutlined /> Restart Agent
      </>
    ),
    key: '7',
  },
  {
    label: (
      <>
        <BugOutlined /> Retrieve Agent Logs
      </>
    ),
    key: '8',
  },
];

export default {
  advancedMenuItems,
  simpleMenuItems,
};

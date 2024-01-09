import {
  BugOutlined,
  DownloadOutlined,
  DownOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ShakeOutlined,
  ThunderboltOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import React from 'react';

export type QuickActionProps = {
  onDropDownClicked: any;
  advancedMenu?: boolean;
};

const simpleMenuItems: MenuProps['items'] = [
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

const advancedMenuItems: MenuProps['items'] = [
  ...simpleMenuItems,
  /* {
    label: (
      <>
        <ReloadOutlined /> Reinstall Agent
      </>
    ),
    key: '4',
  },*/
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
    key: '7',
  },
];

const QuickActionDropDown: React.FC<QuickActionProps> = (props) => {
  const onClick: MenuProps['onClick'] = ({ key }) => {
    props.onDropDownClicked(key);
  };
  const items = props.advancedMenu === true ? advancedMenuItems : simpleMenuItems;
  return (
    <Dropdown menu={{ items, onClick }}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

export default QuickActionDropDown;

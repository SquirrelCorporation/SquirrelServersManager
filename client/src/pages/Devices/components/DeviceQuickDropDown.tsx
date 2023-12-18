import React from "react";
import {Dropdown, MenuProps, Space} from "antd";
import {DownOutlined, LoginOutlined, ReloadOutlined, ShakeOutlined} from "@ant-design/icons";

export type QuickActionProps = {
  onDropDownClicked: any;
};

const items: MenuProps['items'] = [
  {
    label: <><ReloadOutlined /> Reboot</>,
    key: '0',
  },
  {
    label:<><LoginOutlined /> Connect</> ,
    key: '1',
  },
  {
    type: 'divider',
  },
  {
    label: <><ShakeOutlined /> Ping</>,
    key: '3',
  },
];


const DeviceQuickDropDown: React.FC<QuickActionProps> = (props) => {
    const onClick: MenuProps['onClick'] = ({ key }) => {
      props.onDropDownClicked(key);
    };
  return (
    <Dropdown menu={{ items, onClick }} trigger={['click']}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          Quick Action
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  )
}

export default DeviceQuickDropDown;

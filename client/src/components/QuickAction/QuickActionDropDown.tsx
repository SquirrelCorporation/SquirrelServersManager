import { DownOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import React from 'react';
import { advancedMenuItems, simpleMenuItems } from '@/components/QuickAction/QuickActionReference';

export type QuickActionProps = {
  onDropDownClicked: any;
  advancedMenu?: boolean;
};

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

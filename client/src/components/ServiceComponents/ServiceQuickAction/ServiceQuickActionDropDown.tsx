import { Types } from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionReference';
import ServiceQuickActionReference from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionReference';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import { ItemType } from 'rc-menu/es/interface';
import React, { ReactNode } from 'react';

export type ServiceQuickActionProps = {
  onDropDownClicked: any;
  children?: ReactNode;
};

const ServiceQuickActionDropDown: React.FC<ServiceQuickActionProps> = (
  props,
) => {
  const [playbookSelectionModalIsOpened, setPlaybookSelectionModalIsOpened] =
    React.useState(false);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const idx = parseInt(key);
    if (idx >= 0) {
      if (idx >= ServiceQuickActionReference.length) {
        alert('Internal Error');
        return;
      }
    }
  };

  const items = ServiceQuickActionReference.map((e, index) => {
    if (e.type === Types.DIVIDER) return { type: 'divider' };
    return {
      label: e.label,
      key: `${index}`,
      children: e.children?.map((f, submenuIndex) => {
        return { label: f.label, key: `${index}-${submenuIndex}` };
      }),
    };
  }) as ItemType[];

  return (
    <>
      <Dropdown menu={{ items, onClick }} placement="bottom">
        <a onClick={(e) => e.preventDefault()}>
          <Space>{props.children ? props.children : <DownOutlined />}</Space>
        </a>
      </Dropdown>
    </>
  );
};

export default ServiceQuickActionDropDown;

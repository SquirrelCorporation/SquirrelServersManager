import ServiceQuickActionReference, {
  ServiceQuickActionReferenceTypes,
} from '@/components/ContainerComponents/ContainerQuickAction/ContainerQuickActionReference';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import { ItemType } from 'rc-menu/es/interface';
import React, { ReactNode } from 'react';
import { API } from 'ssm-shared-lib';

export type ServiceQuickActionProps = {
  onDropDownClicked: (idx: number) => Promise<void>;
  children?: ReactNode;
  container: API.Container;
};

const ContainerQuickActionDropDown: React.FC<ServiceQuickActionProps> = ({
  onDropDownClicked,
  children,
  container,
}) => {
  const onClick: MenuProps['onClick'] = ({ key }) => {
    const idx = parseInt(key);
    if (idx >= 0) {
      if (idx >= ServiceQuickActionReference.length) {
        alert('Internal Error');
        return;
      }
    }
    void onDropDownClicked(idx);
  };

  const items = ServiceQuickActionReference.filter((e) =>
    e.supportedBy.includes(container.displayType),
  ).map((e, index) => {
    if (e.type === ServiceQuickActionReferenceTypes.DIVIDER)
      return { type: 'divider' };
    return {
      label: e.label,
      icon: e.icon,
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
          <Space>{children ? children : <DownOutlined />}</Space>
        </a>
      </Dropdown>
    </>
  );
};

export default ContainerQuickActionDropDown;

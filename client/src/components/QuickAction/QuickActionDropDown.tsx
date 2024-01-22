import { TerminalModalProps, TerminalStateProps } from '@/components/TerminalModal';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import QuickActionReference from '@/components/QuickAction/QuickActionReference';

export type QuickActionProps = {
  onDropDownClicked: any;
  advancedMenu?: boolean;
  setTerminal: Dispatch<SetStateAction<TerminalStateProps>>;
};

const QuickActionDropDown: React.FC<QuickActionProps> = (props) => {
  const onClick: MenuProps['onClick'] = ({ key}) => {
    const idx = parseInt(key);
    if (idx >= 0) {
      if (idx >= QuickActionReference.length) {
        alert("Internal Error");
        return;
      }
      if (QuickActionReference[idx].type === 'playbook') {
        props.setTerminal({ isOpen: true, command: QuickActionReference[idx].playbookFile })
      } else {
        props.onDropDownClicked(key);
      }
    }

  };

  const items = QuickActionReference.map((e, index) => {
    if (e.onAdvancedMenu && props.advancedMenu === true) {
      if (e.type === 'divider') return { type: e.type };
     return {
       label: e.label,
       key: `${index}`,
     }
    } else if (!e.onAdvancedMenu) {
      if (e.type === 'divider') return { type: e.type };
      return {
        label: e.label,
        key: `${index}`,
      }
    }
  });

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

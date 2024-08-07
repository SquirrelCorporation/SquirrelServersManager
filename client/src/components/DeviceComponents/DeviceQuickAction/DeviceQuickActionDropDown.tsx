import { TerminalStateProps } from '@/components/TerminalModal';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import DeviceQuickActionReference, {
  Types,
} from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionReference';
import PlaybookSelectionModal from '@/components/PlaybookSelection/PlaybookSelectionModal';
import { ItemType } from 'rc-menu/es/interface';
import { API } from 'ssm-shared-lib';

export type QuickActionProps = {
  onDropDownClicked: any;
  advancedMenu?: boolean;
  setTerminal: Dispatch<SetStateAction<TerminalStateProps>>;
  target?: API.DeviceItem[];
  children?: ReactNode;
};

const DeviceQuickActionDropDown: React.FC<QuickActionProps> = (props) => {
  const [playbookSelectionModalIsOpened, setPlaybookSelectionModalIsOpened] =
    React.useState(false);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const idx = parseInt(key);
    if (idx >= 0) {
      if (idx >= DeviceQuickActionReference.length) {
        alert('Internal Error');
        return;
      }
      if (DeviceQuickActionReference[idx].type === Types.PLAYBOOK) {
        props.setTerminal({
          isOpen: true,
          quickRef: DeviceQuickActionReference[idx].playbookQuickRef,
          target: props.target,
        });
      } else if (
        DeviceQuickActionReference[idx].type === Types.PLAYBOOK_SELECTION
      ) {
        setPlaybookSelectionModalIsOpened(true);
      } else {
        props.onDropDownClicked(idx);
      }
    }
  };

  const items = DeviceQuickActionReference.map((e, index) => {
    if (e.onAdvancedMenu && props.advancedMenu === true) {
      if (e.type === Types.DIVIDER) return { type: 'divider' };
      return {
        label: e.label,
        key: `${index}`,
        children: e.children?.map((f, submenuIndex) => {
          return { label: f.label, key: `${index}-${submenuIndex}` };
        }),
      };
    } else if (!e.onAdvancedMenu) {
      if (e.type === Types.DIVIDER) return { type: 'divider' };
      return {
        label: e.label,
        key: `${index}`,
        children: e.children?.map((f, submenuIndex) => {
          return { label: f.label, key: `${index}-${submenuIndex}` };
        }),
      };
    }
  }) as ItemType[];

  const onSelectPlaybook = (
    playbook: string,
    playbookName: string,
    target: API.DeviceItem[] | undefined,
    extraVars?: API.ExtraVars,
  ) => {
    props.setTerminal({
      isOpen: true,
      command: playbook,
      target: props.target,
      extraVars: extraVars,
      playbookName: playbookName,
    });
  };

  return (
    <>
      <PlaybookSelectionModal
        isModalOpen={playbookSelectionModalIsOpened}
        setIsModalOpen={setPlaybookSelectionModalIsOpened}
        itemSelected={props.target}
        callback={onSelectPlaybook}
      />
      <Dropdown menu={{ items, onClick }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>{props.children ? props.children : <DownOutlined />}</Space>
        </a>
      </Dropdown>
    </>
  );
};

export default DeviceQuickActionDropDown;

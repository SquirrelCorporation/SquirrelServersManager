import { TerminalStateProps } from '@/components/TerminalModal';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import QuickActionReference, {
  Types,
} from '@/components/QuickAction/QuickActionReference';
import PlaybookSelectionModal from '@/components/PlaybookSelectionModal/PlaybookSelectionModal';
import { ItemType } from 'rc-menu/es/interface';
import { API } from 'ssm-shared-lib';

export type QuickActionProps = {
  onDropDownClicked: any;
  advancedMenu?: boolean;
  setTerminal: Dispatch<SetStateAction<TerminalStateProps>>;
  target?: API.DeviceItem[];
  children?: ReactNode;
};

const QuickActionDropDown: React.FC<QuickActionProps> = (props) => {
  const [playbookSelectionModalIsOpened, setPlaybookSelectionModalIsOpened] =
    React.useState(false);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const idx = parseInt(key);
    if (idx >= 0) {
      if (idx >= QuickActionReference.length) {
        alert('Internal Error');
        return;
      }
      if (QuickActionReference[idx].type === Types.PLAYBOOK) {
        props.setTerminal({
          isOpen: true,
          command: QuickActionReference[idx].playbookFile,
          target: props.target,
        });
      } else if (QuickActionReference[idx].type === Types.PLAYBOOK_SELECTION) {
        setPlaybookSelectionModalIsOpened(true);
      } else {
        props.onDropDownClicked(key);
      }
    }
  };

  const items = QuickActionReference.map((e, index) => {
    if (e.onAdvancedMenu && props.advancedMenu === true) {
      if (e.type === Types.DIVIDER) return { type: 'divider' };
      return {
        label: e.label,
        key: `${index}`,
      };
    } else if (!e.onAdvancedMenu) {
      if (e.type === Types.DIVIDER) return { type: 'divider' };
      return {
        label: e.label,
        key: `${index}`,
      };
    }
  }) as ItemType[];

  const onSelectPlaybook = (
    playbook: string,
    target: API.DeviceItem[] | undefined,
    extraVars?: API.ExtraVars,
  ) => {
    props.setTerminal({
      isOpen: true,
      command: playbook,
      target: props.target,
      extraVars: extraVars,
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

export default QuickActionDropDown;

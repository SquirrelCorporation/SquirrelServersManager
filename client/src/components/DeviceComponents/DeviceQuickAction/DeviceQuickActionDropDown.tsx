import DeviceInformationModal, {
  DeviceInformationModalHandles,
} from '@/components/DeviceComponents/DeviceInformation/DeviceInformationModal';
import DeviceQuickActionReference, {
  Actions,
  Types,
} from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionReference';
import SFTPDrawer, {
  SFTPDrawerHandles,
} from '@/components/DeviceComponents/SFTPDrawer/SFTPDrawer';
import { TerminalStateProps } from '@/components/PlaybookExecutionModal';
import PlaybookSelectionModal from '@/components/PlaybookSelection/PlaybookSelectionModal';
import { DownOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Dropdown, MenuProps, Popconfirm, Space } from 'antd';
import { ItemType } from 'rc-menu/es/interface';
import React, { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

export type QuickActionProps = {
  onDropDownClicked: any;
  advancedMenu?: boolean;
  setTerminal: Dispatch<SetStateAction<TerminalStateProps>>;
  target?: API.DeviceItem;
  children?: ReactNode;
};

const DeviceQuickActionDropDown: React.FC<QuickActionProps> = ({
  onDropDownClicked,
  advancedMenu,
  setTerminal,
  target,
  children,
}) => {
  const [playbookSelectionModalIsOpened, setPlaybookSelectionModalIsOpened] =
    React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState({
    visible: false,
    onConfirm: () => {},
  });
  const ref: RefObject<SFTPDrawerHandles> =
    React.createRef<SFTPDrawerHandles>();
  const deviceInformationRef: RefObject<DeviceInformationModalHandles> =
    React.createRef<DeviceInformationModalHandles>();
  const onClick: MenuProps['onClick'] = ({ key }) => {
    const idx = parseInt(key);
    if (idx >= 0) {
      if (idx >= DeviceQuickActionReference.length) {
        alert('Internal Error');
        return;
      }

      if (DeviceQuickActionReference[idx].action === Actions.CONNECT) {
        history.push({
          pathname: `/manage/devices/ssh/${target?.uuid}`,
        });
        return;
      }
      if (DeviceQuickActionReference[idx].action === Actions.BROWSE_FILES) {
        ref?.current?.showDrawer();
        return;
      }
      if (DeviceQuickActionReference[idx].action === Actions.VIEW) {
        deviceInformationRef?.current?.open();
        return;
      }
      if (DeviceQuickActionReference[idx].action === Actions.MANAGEMENT) {
        //deviceManagementRef?.current?.open();
        return;
      }
      if (DeviceQuickActionReference[idx].type === Types.PLAYBOOK) {
        if (DeviceQuickActionReference[idx].needConfirmation) {
          setShowConfirmation({
            visible: true,
            onConfirm: () => {
              setTerminal({
                isOpen: true,
                quickRef: DeviceQuickActionReference[idx].playbookQuickRef,
                target: target ? [target] : undefined,
              });
            },
          });
          return;
        }
        setTerminal({
          isOpen: true,
          quickRef: DeviceQuickActionReference[idx].playbookQuickRef,
          target: target ? [target] : undefined,
        });
        return;
      }
      if (DeviceQuickActionReference[idx].type === Types.PLAYBOOK_SELECTION) {
        setPlaybookSelectionModalIsOpened(true);
        return;
      }
      onDropDownClicked(idx);
    }
  };

  const items = DeviceQuickActionReference.map((e, index) => {
    if (!target && e.action === Actions.CONNECT) {
      return;
    }
    if (e.onAdvancedMenu && advancedMenu === true) {
      if (e.type === Types.DIVIDER) return { type: 'divider' };
      return {
        icon: e.icon,
        label: e.label,
        key: `${index}`,
        children: e.children?.map((f, submenuIndex) => {
          return { label: f.label, key: `${index}-${submenuIndex}` };
        }),
      };
    } else if (!e.onAdvancedMenu) {
      if (e.type === Types.DIVIDER) return { type: 'divider' };
      return {
        icon: e.icon,
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
    _target: API.DeviceItem[] | undefined,
    extraVars?: API.ExtraVars,
    mode?: SsmAnsible.ExecutionMode,
  ) => {
    setTerminal({
      isOpen: true,
      command: playbook,
      target: _target,
      extraVars: extraVars,
      playbookName: playbookName,
      mode: mode,
    });
  };

  return (
    <>
      <PlaybookSelectionModal
        isModalOpen={playbookSelectionModalIsOpened}
        setIsModalOpen={setPlaybookSelectionModalIsOpened}
        itemSelected={target ? [target] : undefined}
        callback={onSelectPlaybook}
      />
      {target && (
        <>
          <DeviceInformationModal ref={deviceInformationRef} device={target} />
        </>
      )}
      <SFTPDrawer device={target as API.DeviceItem} ref={ref} />
      <Popconfirm
        title={'Are you sure you want to execute this action?'}
        open={showConfirmation.visible}
        onConfirm={() => {
          showConfirmation.onConfirm();
          setShowConfirmation({ visible: false, onConfirm: () => {} });
        }}
        onCancel={() =>
          setShowConfirmation({ visible: false, onConfirm: () => {} })
        }
        okText="Yes"
        cancelText="No"
      />
      <Dropdown menu={{ items, onClick }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>{children ? children : <DownOutlined />}</Space>
        </a>
      </Dropdown>
    </>
  );
};

export default DeviceQuickActionDropDown;

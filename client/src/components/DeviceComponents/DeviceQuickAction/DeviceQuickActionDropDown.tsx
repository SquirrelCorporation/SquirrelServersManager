import DeviceManagementModal, {
  DeviceManagementModalHandles,
} from '@/components/DeviceComponents/Device/DeviceManagementModal';
import DeviceInformationModal, {
  DeviceInformationModalHandles,
} from '@/components/DeviceComponents/Device/DeviceInformationModal';
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

const DeviceQuickActionDropDown: React.FC<QuickActionProps> = (props) => {
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
  const deviceManagementRef: RefObject<DeviceManagementModalHandles> =
    React.createRef<DeviceManagementModalHandles>();
  const onClick: MenuProps['onClick'] = ({ key }) => {
    const idx = parseInt(key);
    if (idx >= 0) {
      if (idx >= DeviceQuickActionReference.length) {
        alert('Internal Error');
        return;
      }

      if (DeviceQuickActionReference[idx].action === Actions.CONNECT) {
        history.push({
          pathname: `/manage/devices/ssh/${props.target?.uuid}`,
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
        deviceManagementRef?.current?.open();
        return;
      }
      if (DeviceQuickActionReference[idx].type === Types.PLAYBOOK) {
        if (DeviceQuickActionReference[idx].needConfirmation) {
          setShowConfirmation({
            visible: true,
            onConfirm: () => {
              props.setTerminal({
                isOpen: true,
                quickRef: DeviceQuickActionReference[idx].playbookQuickRef,
                target: props.target ? [props.target] : undefined,
              });
            },
          });
          return;
        }
        props.setTerminal({
          isOpen: true,
          quickRef: DeviceQuickActionReference[idx].playbookQuickRef,
          target: props.target ? [props.target] : undefined,
        });
        return;
      }
      if (DeviceQuickActionReference[idx].type === Types.PLAYBOOK_SELECTION) {
        setPlaybookSelectionModalIsOpened(true);
        return;
      }
      props.onDropDownClicked(idx);
    }
  };

  const items = DeviceQuickActionReference.map((e, index) => {
    if (!props.target && e.action === Actions.CONNECT) {
      return;
    }
    if (e.onAdvancedMenu && props.advancedMenu === true) {
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
    target: API.DeviceItem[] | undefined,
    extraVars?: API.ExtraVars,
    mode?: SsmAnsible.ExecutionMode,
  ) => {
    props.setTerminal({
      isOpen: true,
      command: playbook,
      target: target,
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
        itemSelected={props.target ? [props.target] : undefined}
        callback={onSelectPlaybook}
      />
      {props.target && (
        <>
          <DeviceInformationModal
            ref={deviceInformationRef}
            device={props.target}
          />
          <DeviceManagementModal
            ref={deviceManagementRef}
            device={props.target}
          />
        </>
      )}
      <SFTPDrawer device={props.target as API.DeviceItem} ref={ref} />
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
          <Space>{props.children ? props.children : <DownOutlined />}</Space>
        </a>
      </Dropdown>
    </>
  );
};

export default DeviceQuickActionDropDown;

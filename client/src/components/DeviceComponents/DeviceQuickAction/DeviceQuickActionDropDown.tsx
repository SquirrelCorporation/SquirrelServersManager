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
import { Dropdown, MenuProps, Popconfirm, Space, message } from 'antd';
import { ItemType } from 'rc-menu/es/interface';
import React, { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';
import {
  playbookExecutionEvents,
  PLAYBOOK_EXECUTION_START,
} from '@/components/HeaderComponents/PlaybookExecutionWidget';
import {
  executePlaybook,
  executePlaybookByQuickRef,
} from '@/services/rest/playbooks/playbooks';

export type QuickActionProps = {
  onDropDownClicked: any;
  advancedMenu?: boolean;
  target?: API.DeviceItem;
  children?: React.ReactNode;
};

const DeviceQuickActionDropDown: React.FC<QuickActionProps> = ({
  onDropDownClicked,
  advancedMenu,
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
  const onClick: MenuProps['onClick'] = async ({ key }) => {
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
        const quickRef = DeviceQuickActionReference[idx].playbookQuickRef;
        const displayName = DeviceQuickActionReference[idx].label;
        const doExecute = async () => {
          try {
            if (!quickRef) {
              message.error({
                type: 'error',
                content: 'Internal error: playbook reference is missing',
                duration: 8,
              });
              return;
            }
            const res = await executePlaybookByQuickRef(
              quickRef,
              target ? [target.uuid] : [],
              undefined,
              undefined,
            );
            playbookExecutionEvents.emit(PLAYBOOK_EXECUTION_START, {
              execId: res.data.execId,
              displayName,
            });
          } catch (error) {
            message.error({
              type: 'error',
              content: 'Error running playbook',
              duration: 8,
            });
          }
        };
        if (DeviceQuickActionReference[idx].needConfirmation) {
          setShowConfirmation({
            visible: true,
            onConfirm: doExecute,
          });
          return;
        }
        doExecute();
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

  const onSelectPlaybook = async (
    playbook: string,
    playbookName: string,
    _target: API.DeviceItem[] | undefined,
    extraVars?: API.ExtraVars,
    mode?: SsmAnsible.ExecutionMode,
  ) => {
    try {
      const res = await executePlaybook(
        playbook,
        _target ? _target.map((e) => e.uuid) : [],
        extraVars,
        mode,
      );
      playbookExecutionEvents.emit(PLAYBOOK_EXECUTION_START, {
        execId: res.data.execId,
        displayName: playbookName,
      });
    } catch (error) {
      message.error({
        type: 'error',
        content: 'Error running playbook',
        duration: 8,
      });
    }
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

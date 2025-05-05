import DeviceLogos from '@/components/DeviceComponents/DeviceLogos';
import DeviceQuickActionReference, {
  Actions,
  Types,
} from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionReference';
import OsSoftwareVersions from '@/components/DeviceComponents/OSSoftwaresVersions/OsSoftwareVersions';
import { GrommetIconsInstall } from '@/components/Icons/CustomIcons';
import NewDeviceModal from '@/components/NewDeviceModal/NewDeviceModal';
import TerminalModal, {
  TerminalStateProps,
} from '@/components/PlaybookExecutionModal';
import PlaybookSelectionModal from '@/components/PlaybookSelection/PlaybookSelectionModal';
import Title, { TitleColors } from '@/components/Template/Title';
import InventoryColumns from '@/pages/Admin/Inventory/InventoryColumns';
import { deleteDevice, getDevices } from '@/services/rest/devices/devices';
import { useParams } from '@@/exports';
import { DatabaseOutlined, WarningOutlined } from '@ant-design/icons';
import type {
  ActionType,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import { Button, Drawer, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import { API, SsmAnsible, SsmAgent } from 'ssm-shared-lib';
import ConfigurationModal from './components/ConfigurationModal';

const Inventory: React.FC = () => {
  const { id } = useParams();
  const [configurationModalOpen, handleConfigurationModalOpen] =
    useState<boolean>(false);
  const [showConfirmDeleteDevice, setShowConfirmDeleteDevice] =
    useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.DeviceItem>();
  const [terminal, setTerminal] = useState<TerminalStateProps>({
    target: undefined,
    isOpen: false,
    command: undefined,
    playbookName: undefined,
    mode: SsmAnsible.ExecutionMode.APPLY,
  });
  const [addNewDeviceModalIsOpen, setAddNewDeviceModalIsOpen] = useState(false);
  const [playbookSelectionModalIsOpened, setPlaybookSelectionModalIsOpened] =
    React.useState(false);
  const [selectedRowsState, setSelectedRows] = useState<API.DeviceItem[]>([]);

  const openOrCloseTerminalModal = (open: boolean) => {
    setTerminal({ ...terminal, isOpen: open });
  };

  const onSelectPlaybook = (
    playbook: string,
    playbookName: string,
    target?: API.DeviceItem[],
    _extraVars?: API.ExtraVars,
    mode?: SsmAnsible.ExecutionMode,
  ) => {
    setTerminal({
      isOpen: true,
      command: playbook,
      target: target,
      playbookName: playbookName,
      mode: mode,
    });
  };

  const onDropDownClicked = (idx: number) => {
    if (DeviceQuickActionReference[idx].type === Types.ACTION) {
      if (DeviceQuickActionReference[idx].action === Actions.DELETE) {
        setShowConfirmDeleteDevice(true);
      }
    }
  };

  const columns = InventoryColumns(
    setCurrentRow,
    setShowDetail,
    handleConfigurationModalOpen,
    onDropDownClicked,
    setTerminal,
  );

  const onAddNewDevice = (
    target: API.DeviceItem,
    installMethod: SsmAgent.InstallMethods,
  ) => {
    actionRef?.current?.reload();
    if (installMethod !== SsmAgent.InstallMethods.LESS) {
      setTerminal({
        target: [target],
        isOpen: true,
        quickRef: 'installAgent',
        extraVars: [{ extraVar: '_ssm_installMethod', value: installMethod }],
      });
    }
  };

  const onDeleteNewDevice = async () => {
    if (currentRow) {
      await deleteDevice(currentRow?.uuid).then(() => {
        setShowConfirmDeleteDevice(false);
        message.warning({ content: 'Device deleted', duration: 6 });
        actionRef?.current?.reload();
      });
    }
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Inventory'}
            backgroundColor={TitleColors.INVENTORY}
            icon={<DatabaseOutlined />}
          />
        ),
      }}
    >
      <Popconfirm
        title="Delete a device"
        description={
          <>
            Are you sure to delete the device? {currentRow?.ip} <br />
            The agent must be manually uninstalled previously before
          </>
        }
        open={showConfirmDeleteDevice}
        onConfirm={() => onDeleteNewDevice()}
        onCancel={() => setShowConfirmDeleteDevice(false)}
        okText="Delete the device and all its data"
        cancelText="Cancel"
        icon={<WarningOutlined style={{ color: 'red' }} />}
      />
      <NewDeviceModal
        isModalOpen={addNewDeviceModalIsOpen}
        setIsModalOpen={setAddNewDeviceModalIsOpen}
        onAddNewDevice={onAddNewDevice}
      />
      <ProTable<API.DeviceItem, API.PageParams>
        headerTitle="List of Devices"
        actionRef={actionRef}
        rowKey="uuid"
        search={{
          labelWidth: 120,
        }}
        request={getDevices}
        onDataSourceChange={(dataSource) => {
          if (id) {
            const foundId = dataSource.find((e) => e.uuid === id);
            if (foundId) {
              setCurrentRow(foundId);
              setShowDetail(true);
            }
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolBarRender={() => {
          return [
            <Button
              key={'add-device'}
              type="primary"
              icon={<GrommetIconsInstall />}
              onClick={() => setAddNewDeviceModalIsOpen(true)}
            >
              Add a new device
            </Button>,
          ];
        }}
      />
      {selectedRowsState?.length > 0 && (
        <>
          <PlaybookSelectionModal
            isModalOpen={playbookSelectionModalIsOpened}
            setIsModalOpen={setPlaybookSelectionModalIsOpened}
            itemSelected={selectedRowsState}
            callback={onSelectPlaybook}
          />
          <FooterToolbar
            extra={
              <div>
                Chosen{' '}
                <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
                item(s)
              </div>
            }
          >
            <Button
              onClick={() => {
                setPlaybookSelectionModalIsOpened(true);
              }}
              type="primary"
            >
              Apply Batch Playbook
            </Button>
          </FooterToolbar>
        </>
      )}
      <TerminalModal
        terminalProps={{ ...terminal, setIsOpen: openOrCloseTerminalModal }}
      />
      <ConfigurationModal
        handleUpdateModalOpen={handleConfigurationModalOpen}
        updateModalOpen={configurationModalOpen}
        device={currentRow || {}}
      />
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.ip && (
          <>
            <ProDescriptions<API.DeviceItem>
              extra={<DeviceLogos device={currentRow} />}
              column={1}
              title={currentRow?.ip}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.ip,
              }}
              columns={columns as ProDescriptionsItemProps<API.DeviceItem>[]}
            />
          </>
        )}
        {currentRow?.systemInformation?.versions && (
          <div style={{ marginTop: '20px' }}>
            <OsSoftwareVersions
              versions={currentRow.systemInformation?.versions}
            />
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default Inventory;

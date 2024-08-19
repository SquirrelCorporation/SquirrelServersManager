import DeviceLogos from '@/components/DeviceComponents/DeviceLogos';
import DeviceQuickActionReference, {
  Actions,
  Types,
} from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionReference';
import OsSoftwareVersions from '@/components/DeviceComponents/OSSoftwaresVersions/OsSoftwareVersions';
import { GrommetIconsInstall } from '@/components/Icons/CustomIcons';
import NewDeviceModal from '@/components/NewDeviceModal/NewDeviceModal';
import NewUnManagedDeviceModal from '@/components/NewDeviceModal/NewUnManagedDeviceModal';
import TerminalModal, {
  TerminalStateProps,
} from '@/components/PlaybookExecutionModal';
import PlaybookSelectionModal from '@/components/PlaybookSelection/PlaybookSelectionModal';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import InventoryColumns from '@/pages/Admin/Inventory/InventoryColumns';
import { deleteDevice, getDevices } from '@/services/rest/device';
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
import {
  Button,
  Col,
  Drawer,
  Dropdown,
  MenuProps,
  message,
  Popconfirm,
  Row,
} from 'antd';
import React, { useRef, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';
import { API } from 'ssm-shared-lib';
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
  });
  const [addNewDeviceModalIsOpen, setAddNewDeviceModalIsOpen] = useState(false);
  const [
    addNewUnManagedDeviceModalIsOpen,
    setAddNewUnManagedDeviceModalIsOpen,
  ] = useState(false);

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
  ) => {
    setTerminal({
      isOpen: true,
      command: playbook,
      target: target,
      playbookName: playbookName,
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
  const onMenuClick: MenuProps['onClick'] = () => {
    setAddNewUnManagedDeviceModalIsOpen(true);
  };
  const items = [
    {
      key: '1',
      label: 'Register an unmanaged device (without agent)',
    },
  ];
  const onAddNewDevice = (target: API.DeviceItem) => {
    actionRef?.current?.reload();
    setTerminal({
      target: [target],
      isOpen: true,
      quickRef: 'installAgent',
    });
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
    <TerminalContextProvider>
      <PageContainer
        header={{
          title: (
            <Title.MainTitle
              title={'Inventory'}
              backgroundColor={PageContainerTitleColors.INVENTORY}
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
        <NewUnManagedDeviceModal
          isModalOpen={addNewUnManagedDeviceModalIsOpen}
          setIsModalOpen={setAddNewUnManagedDeviceModalIsOpen}
        />

        <ProTable<API.DeviceItem, API.PageParams>
          headerTitle="List of Devices"
          actionRef={actionRef}
          rowKey="ip"
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
              <Dropdown.Button
                menu={{ items, onClick: onMenuClick }}
                key="3"
                type="primary"
                onClick={() => {
                  setAddNewDeviceModalIsOpen(true);
                }}
              >
                <Row>
                  <Col>
                    <GrommetIconsInstall />
                  </Col>
                  <Col>&nbsp;Install agent on new device</Col>
                </Row>
              </Dropdown.Button>,
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
          values={currentRow || {}}
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
          {currentRow?.versions && (
            <div style={{ marginTop: '20px' }}>
              <OsSoftwareVersions versions={currentRow.versions} />
            </div>
          )}
        </Drawer>
      </PageContainer>
    </TerminalContextProvider>
  );
};

export default Inventory;

import DeviceLogos from '@/components/DeviceLogos/DeviceLogos';
import NewDeviceModal from '@/components/NewDeviceModal/NewDeviceModal';
import { OsLogo } from '@/components/OsLogo/OsLogo';
import { DeviconPlainBash } from '@/components/OSSoftwaresVersions/SoftwareIcons';
import PlaybookSelectionModal from '@/components/PlaybookSelectionModal/PlaybookSelectionModal';
import QuickActionReference, {
  Actions,
  Types,
} from '@/components/QuickAction/QuickActionReference';
import TerminalModal, { TerminalStateProps } from '@/components/TerminalModal';
import InventoryColumns from '@/pages/Admin/Inventory/InventoryColumns';
import { deleteDevice, getDevices } from '@/services/rest/device';
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
  Card,
  Col,
  Drawer,
  Dropdown,
  MenuProps,
  message,
  Popconfirm,
  Row,
  Typography,
} from 'antd';
import React, { Key, useRef, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';
import ConfigurationModal from './components/ConfigurationModal';
import OsSoftwareVersions from '@/components/OSSoftwaresVersions/OsSoftwareVersions';
import NewUnManagedDeviceModal from '@/components/NewDeviceModal/NewUnManagedDeviceModal';
import { API } from 'ssm-shared-lib';
import {
  DatabaseOutlined,
  InteractionOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import Avatar from 'antd/es/avatar/avatar';

const Inventory: React.FC = () => {
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showConfirmDeleteDevice, setShowConfirmDeleteDevice] =
    useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.DeviceItem>();
  const [terminal, setTerminal] = useState<TerminalStateProps>({
    target: undefined,
    isOpen: false,
    command: undefined,
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
  const onSelectPlaybook = (playbook: string, target?: API.DeviceItem[]) => {
    setTerminal({
      isOpen: true,
      command: playbook,
      target: target,
    });
  };
  const GrommetIconsInstall = (props: any) => (
    <svg
      width="0.8em"
      height="0.8em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M19 13.5v4L12 22l-7-4.5v-4m7 8.5v-8.5m6.5-5l-6.5-4L15.5 2L22 6zm-13 0l6.5-4L8.5 2L2 6zm13 .5L12 13l3.5 2.5l6.5-4zm-13 0l6.5 4l-3.5 2.5l-6.5-4z"
      />
    </svg>
  );

  const onDropDownClicked = (idx: number) => {
    if (QuickActionReference[idx].type === Types.ACTION) {
      if (QuickActionReference[idx].action === Actions.CONNECT) {
        window.location.href = 'ssh://' + currentRow?.ip;
      }
      if (QuickActionReference[idx].action === Actions.DELETE) {
        setShowConfirmDeleteDevice(true);
      }
    }
  };

  const columns = InventoryColumns(
    setCurrentRow,
    setShowDetail,
    handleUpdateModalOpen,
    onDropDownClicked,
    setTerminal,
  );
  const onMenuClick: MenuProps['onClick'] = (e) => {
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
      command: '_installAgent',
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
            <Row>
              <Col>
                <Avatar
                  style={{ backgroundColor: '#9f0f2e' }}
                  shape="square"
                  icon={<DatabaseOutlined />}
                />
              </Col>
              <Col
                style={{
                  marginLeft: 5,
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
              >
                <Typography.Title
                  style={{
                    marginLeft: 5,
                    marginTop: 'auto',
                    marginBottom: 'auto',
                  }}
                  level={4}
                >
                  {' '}
                  Inventory
                </Typography.Title>
              </Col>
            </Row>
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
          rowKey="uuid"
          search={{
            labelWidth: 120,
          }}
          request={getDevices}
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
          handleUpdateModalOpen={handleUpdateModalOpen}
          updateModalOpen={updateModalOpen}
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

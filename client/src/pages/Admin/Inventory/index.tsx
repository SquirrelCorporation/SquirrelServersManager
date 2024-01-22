import NewDeviceModal from '@/components/NewDeviceModal/NewDeviceModal';
import QuickActionDropDown from '@/components/QuickAction/QuickActionDropDown';
import TerminalModal, { TerminalStateProps } from '@/components/TerminalModal';
import { OsLogo } from '@/components/misc/OsLogo';
import { getDevices, updateRule } from '@/services/rest/device';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Button, Drawer, message } from 'antd';
import React, { useRef, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';
import type { FormValueType } from './components/ConfigurationForm';
import ConfigurationForm from './components/ConfigurationForm';
import { AddCircleOutline } from 'antd-mobile-icons';

const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configuring');
  try {
    await updateRule({
      name: fields.ip,
      desc: fields.hostname,
      key: fields.uuid,
    });
    hide();
    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

const Inventory: React.FC = () => {
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.DeviceItem>();
  const [terminal, setTerminal] = useState<TerminalStateProps>({ isOpen: false, command: undefined});
  const [addNewDeviceModalIsOpen, setAddNewDeviceModalIsOpen] = useState(false);

  const openOrCloseTerminalModal = (open: boolean) => {
    setTerminal({...terminal, isOpen: open});
  };

  const onDropDownClicked = (key: string) => {

  };

  const columns: ProColumns<API.DeviceItem>[] = [
    {
      title: 'Type',
      dataIndex: 'osLogoFile',
      render: (dom, entity) => {
        return <Avatar src={<img src={OsLogo(entity.osLogoFile)} alt={entity.osLogoFile} />} />;
      },
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      //tip: 'The rule name is the unique key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      valueType: 'textarea',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: 'Registering',
          status: 'Warning',
        },
        1: {
          text: 'Online',
          status: 'Success',
        },
        2: {
          text: 'Down',
          status: 'Error',
        },
      },
    },
    {
      title: 'Os Distro',
      dataIndex: 'osDistro',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'Os Arch',
      dataIndex: 'osArch',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'Os Code Name',
      dataIndex: 'osCodeName',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'Os Platform',
      dataIndex: 'osPlatform',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'Os Kernel',
      dataIndex: 'osKernel',
      valueType: 'textarea',
      hideInTable: true,
    },

    {
      title: 'CPU Brand',
      dataIndex: 'cpuBrand',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'System Manufacturer ',
      dataIndex: 'systemManufacturer',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'System Model',
      dataIndex: 'systemModel',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'Updated at',
      sorter: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
    },
    {
      title: 'Agent Version',
      sorter: true,
      dataIndex: 'agentVersion',
      valueType: 'textarea',
    },
    {
      title: 'Operating',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          Configuration
        </a>,
        <a
          key="quickAction"
          onClick={() => {
            setCurrentRow(record);
          }}
        >
          <QuickActionDropDown advancedMenu={true} onDropDownClicked={onDropDownClicked} setTerminal={setTerminal}/>
        </a>,
      ],
    },
  ];
  const [selectedRowsState, setSelectedRows] = useState<API.DeviceItem[]>([]);
  return (
    <TerminalContextProvider>
      <PageContainer>
        <NewDeviceModal
          isModalOpen={addNewDeviceModalIsOpen}
          setIsModalOpen={setAddNewDeviceModalIsOpen}
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
              <Button
                key="3"
                type="primary"
                onClick={() => {
                  setAddNewDeviceModalIsOpen(true);
                }}
                icon={<AddCircleOutline />}
              >
                Install agent on new device
              </Button>,
            ];
          }}
        />
        {selectedRowsState?.length > 0 && (
          <FooterToolbar
            extra={
              <div>
                Chosen <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> item(s)
              </div>
            }
          >
            <Button type="primary">Apply Batch Playbook</Button>
          </FooterToolbar>
        )}
        <TerminalModal terminalProps={{...terminal, setIsOpen: openOrCloseTerminalModal}} />
        <ConfigurationForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalOpen(false);
            if (!showDetail) {
              setCurrentRow(undefined);
            }
          }}
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
            <ProDescriptions<API.DeviceItem>
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
          )}
        </Drawer>
      </PageContainer>
    </TerminalContextProvider>
  );
};

export default Inventory;

import DeviceQuickActionDropDown from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionDropDown';
import { Proxmox, Remote, UserSecret } from '@/components/Icons/CustomIcons';
import { DockerOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Tag, Tooltip } from 'antd';
import React from 'react';
import { API, SsmAgent } from 'ssm-shared-lib';

const InventoryColumns = (
  setCurrentRow: any,
  setShowDetail: any,
  handleUpdateModalOpen: any,
  onDropDownClicked: any,
  setTerminal: any,
) => {
  const columns: ProColumns<API.DeviceItem>[] = [
    {
      title: 'SSM Device ID',
      dataIndex: 'uuid',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      render: (dom, entity) => {
        return (
          <a
            key={entity.uuid}
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
        3: {
          text: 'Unmanaged',
          status: 'Processing',
        },
      },
    },
    {
      title: 'Capabilities',
      width: '10%',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <>
            {entity.capabilities?.containers?.docker?.enabled && (
              <Tooltip title="Docker is enabled">
                <Tag icon={<DockerOutlined />} />
              </Tooltip>
            )}
            {entity.capabilities?.containers?.proxmox?.enabled && (
              <Tooltip title="Proxmox is enabled">
                <Tag icon={<Proxmox />} />
              </Tooltip>
            )}
          </>
        );
      },
    },
    {
      title: 'Updated at',
      sorter: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: 'Mode',
      sorter: true,
      dataIndex: 'agentType',
      render: (dom, entity) => {
        return (
          <>
            {(entity.agentType === SsmAgent.InstallMethods.LESS && (
              <Tooltip title="Remote SSH information gathered from the host">
                <Tag icon={<Remote />} />
              </Tooltip>
            )) || (
              <Tooltip title={'Agent installed on the host'}>
                <Tag icon={<UserSecret />} />
              </Tooltip>
            )}
          </>
        );
      },
    },
    {
      title: 'Operating',
      dataIndex: 'option',
      valueType: 'option',
      hideInSearch: true,
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
          <DeviceQuickActionDropDown
            advancedMenu={true}
            onDropDownClicked={onDropDownClicked}
            setTerminal={setTerminal}
            target={record}
          />
        </a>,
      ],
    },
  ];
  return columns;
};

export default InventoryColumns;

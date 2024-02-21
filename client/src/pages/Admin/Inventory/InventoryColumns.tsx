import { OsLogo } from '@/components/OsLogo/OsLogo';
import QuickActionDropDown from '@/components/QuickAction/QuickActionDropDown';
import type { ProColumns } from '@ant-design/pro-components';
import { Avatar } from 'antd';
import React from 'react';

const InventoryColumns = (
  setCurrentRow: any,
  setShowDetail: any,
  handleUpdateModalOpen: any,
  onDropDownClicked: any,
  setTerminal: any,
) => {
  const columns: ProColumns<API.DeviceItem>[] = [
    {
      title: 'Type',
      dataIndex: 'osLogoFile',
      render: (dom, entity) => {
        return (
          <Avatar
            src={
              <img src={OsLogo(entity.osLogoFile)} alt={entity.osLogoFile} />
            }
          />
        );
      },
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
          <QuickActionDropDown
            advancedMenu={true}
            onDropDownClicked={onDropDownClicked}
            setTerminal={setTerminal}
            target={[record]}
          />
        </a>,
      ],
    },
  ];
  return columns;
};

export default InventoryColumns;

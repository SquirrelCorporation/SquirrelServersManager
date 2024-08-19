import DeviceQuickActionDropDown from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionDropDown';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Col, Row, Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const InventoryColumns = (
  setCurrentRow: any,
  setShowDetail: any,
  handleUpdateModalOpen: any,
  onDropDownClicked: any,
  setTerminal: any,
) => {
  const columns: ProColumns<API.DeviceItem>[] = [
    {
      title: 'Host Id',
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
      title: 'Watch Containers',
      dataIndex: 'dockerWatcher',
      width: '10%',
      hideInSearch: true,
      render: (dom, entity) => {
        return entity.dockerWatcher ? (
          <Row style={{ alignItems: 'center' }} justify="center">
            <Col>
              <CheckCircleOutlined
                style={{ fontSize: '16px', color: '#08c', marginRight: '4px' }}
              />
            </Col>
            <Col>
              <Typography.Text>({entity.dockerWatcherCron})</Typography.Text>
            </Col>
          </Row>
        ) : (
          <Row style={{ alignItems: 'center' }} justify="center">
            <Col>
              <CloseCircleOutlined
                style={{
                  fontSize: '16px',
                  color: '#cc0036',
                  marginRight: '4px',
                }}
              />
            </Col>
            <Col>
              <Typography.Text>({entity.dockerWatcherCron})</Typography.Text>
            </Col>
          </Row>
        );
      },
    },
    {
      title: 'Os Distro',
      dataIndex: 'osDistro',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Os Arch',
      dataIndex: 'osArch',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Os Code Name',
      dataIndex: 'osCodeName',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Os Platform',
      dataIndex: 'osPlatform',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Os Kernel',
      dataIndex: 'osKernel',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },

    {
      title: 'CPU Brand',
      dataIndex: 'cpuBrand',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'System Manufacturer ',
      dataIndex: 'systemManufacturer',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'System Model',
      dataIndex: 'systemModel',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Updated at',
      sorter: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: 'Agent Version',
      sorter: true,
      dataIndex: 'agentVersion',
      valueType: 'textarea',
    },
    {
      title: 'Docker Version',
      sorter: true,
      dataIndex: 'dockerVersion',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
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

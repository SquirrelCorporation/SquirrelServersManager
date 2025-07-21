import { Bridge, GrommetIconsHost } from '@/components/Icons/CustomIcons';
import CreateNetworkModal from '@/pages/Containers/components/sub-components/CreateNetworkModal';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getNetworks } from '@/services/rest/containers/container-networks';
import {
  ProColumns,
  ProFormSelect,
  ProTable,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { Avatar, Tag, Tooltip } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';

const Networks: React.FC = () => {
  const columns: ProColumns<API.ContainerNetwork>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '20%',
    },
    {
      dataIndex: 'deviceUuid',
      hideInTable: true,
      title: 'Device',
      renderFormItem: () => (
        <ProFormSelect
          request={async () => {
            return await getAllDevices().then((e: API.DeviceList) => {
              return e.data?.map((f: API.DeviceItem) => {
                return {
                  label: `${f.fqdn} (${f.ip})`,
                  value: f.uuid,
                };
              }) as RequestOptionsType[];
            });
          }}
        />
      ),
    },
    {
      title: 'Device',
      dataIndex: ['device', 'ip'],
      search: false,
      width: '10%',
      render: (text, record) => (
        <Tooltip title={record.device?.fqdn}>
          <Tag
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {record.device?.ip}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
    },
    {
      title: 'Driver',
      dataIndex: 'driver',
      render: (text, record) => (
        <>
          {record.driver === 'host' && (
            <Avatar
              shape={'square'}
              src={<GrommetIconsHost />}
              size={{ xs: 1 }}
            />
          )}
          {record.driver === 'bridge' && (
            <Avatar shape={'square'} src={<Bridge />} size={{ xs: 1 }} />
          )}{' '}
          {record.driver === 'null' ? '-' : record.driver}
        </>
      ),
    },
    {
      title: 'Attachable',
      dataIndex: 'attachable',
      valueType: 'switch',
      render: (text, record) => (record.attachable ? 'Yes' : 'No'),
    },
    {
      title: 'IPAM Driver',
      dataIndex: ['ipam', 'Driver'],
      search: false,
    },
    {
      title: 'IPV4 IPAM Subnet',
      search: false,
      render: (text, record) => record.ipam?.Config?.map((e: any) => e.Subnet),
    },
    {
      title: 'IPV4 IPAM Gateway',
      search: false,
      render: (text, record) => record.ipam?.Config?.map((e: any) => e.Gateway),
    },
  ];

  return (
    <ProTable<API.ContainerNetwork>
      columns={columns}
      request={getNetworks}
      rowKey="id"
      search={{
        labelWidth: 'auto',
        filterType: 'light',
      }}
      options={false}
      pagination={{
        defaultPageSize: 20,
        showSizeChanger: true,
      }}
      toolBarRender={() => [
        <CreateNetworkModal key={'create-network'} />,
        <InfoLinkWidget
          tooltipTitle="Help for containers."
          documentationLink="https://squirrelserversmanager.io/docs/user-guides/containers/management"
        />,
      ]}
    />
  );
};

export default Networks;

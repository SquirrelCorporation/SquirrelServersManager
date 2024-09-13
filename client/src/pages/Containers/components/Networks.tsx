import { Bridge, GrommetIconsHost } from '@/components/Icons/CustomIcons';
import CreateNetworkModal from '@/pages/Containers/components/sub-components/CreateNetworkModal';
import { getDevices } from '@/services/rest/device';
import { getNetworks } from '@/services/rest/services';
import {
  ActionType,
  ProColumns,
  ProFormSelect,
  ProTable,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { Avatar, Tag, Tooltip } from 'antd';
import React, { useRef } from 'react';
import { API } from 'ssm-shared-lib';

const Networks: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<API.ContainerNetwork>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      ellipsis: false,
    },
    {
      dataIndex: 'deviceUuid',
      hideInTable: true,
      title: 'Device',
      renderFormItem: () => (
        <ProFormSelect
          request={async () => {
            return await getDevices().then((e: API.DeviceList) => {
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
      render: (text, record) => (
        <Tooltip title={record.device?.fqdn}>
          <Tag>{record.device?.ip}</Tag>
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
            <Avatar shape={'square'} src={<GrommetIconsHost />} />
          )}
          {record.driver === 'bridge' && (
            <Avatar shape={'square'} src={<Bridge />} />
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
      toolBarRender={() => [<CreateNetworkModal key={'create-network'} />]}
    />
  );
};

export default Networks;

import { getDevices } from '@/services/rest/device';
import { getImages } from '@/services/rest/services';
import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormSelect,
  ProTable,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { Button, Tag, Tooltip } from 'antd';
import React, { useRef } from 'react';
import { API } from 'ssm-shared-lib';
import moment from 'moment';

const Images: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<API.ContainerImage>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      ellipsis: true,
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
      title: 'Tags',
      width: '30%',
      search: false,
      render: (text, record) => <Tag>{record.repoTags?.map((e) => e)}</Tag>,
    },
    {
      title: 'Parent Id',
      dataIndex: 'parentId',
      ellipsis: true,
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
      title: 'NB Containers',
      dataIndex: 'containers',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      search: false,
      render: (text, record) =>
        moment.unix(record.created).format('MM/DD/YYYY HH:mm'),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      search: false,
      render: (text, record) =>
        record.size ? `${(record.size / 1000 / 1000).toFixed(0)} Mb` : 'NA',
    },
  ];

  return (
    <ProTable<API.ContainerImage>
      columns={columns}
      request={getImages}
      rowKey="name"
      search={{
        filterType: 'light',
      }}
      options={false}
      pagination={{
        defaultPageSize: 20,
        showSizeChanger: true,
      }}
      toolBarRender={() => [
        <Button
          key="button"
          disabled
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          Add an image
        </Button>,
      ]}
    />
  );
};

export default Images;

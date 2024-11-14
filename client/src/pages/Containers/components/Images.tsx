import { getAllDevices } from '@/services/rest/device';
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
import moment from 'moment';
import React, { useRef } from 'react';
import { API } from 'ssm-shared-lib';

const Images: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<API.ContainerImage>[] = [
    {
      title: 'Tags',
      width: '30%',
      search: false,
      render: (text, record) => (
        <>
          {record.repoTags?.map((e) => (
            <Tag
              key={e}
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {e}
            </Tag>
          ))}
        </>
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
      title: 'Id',
      dataIndex: 'id',
      width: '10%',
      ellipsis: true,
      responsive: ['sm'],
    },
    {
      title: 'Parent Id',
      dataIndex: 'parentId',
      responsive: ['sm'],
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
      title: 'NB Containers',
      dataIndex: 'containers',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      search: false,
      responsive: ['sm'],
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

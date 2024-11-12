import ContainerBackUpVolumeModal from '@/pages/Containers/components/sub-components/ContainerBackUpVolumeModal';
import CreateVolumeModal from '@/pages/Containers/components/sub-components/CreateVolumeModal';
import { getAllDevices } from '@/services/rest/device';
import { getVolumes } from '@/services/rest/services';
import {
  ProColumns,
  ProFormSelect,
  ProTable,
  RequestOptionsType,
  TableDropdown,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Tag, Tooltip } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const Volumes: React.FC = () => {
  const columns: ProColumns<API.ContainerVolume>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      ellipsis: true,
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
    },
    {
      title: 'Mount Point',
      dataIndex: 'mountPoint',
      ellipsis: true,
      search: false,
    },
    {
      title: 'Action',
      key: 'option',
      valueType: 'option',
      render: (dom, record) =>
        record.device?.ip
          ? [
              <ContainerBackUpVolumeModal
                key="backup"
                volumeUuid={record.uuid}
              />,
              <TableDropdown
                key="actionGroup"
                menus={[{ key: 'backup-aut', name: 'New Backup Automation' }]}
                onSelect={(key: string) => {
                  if (key === 'backup-aut') {
                    history.push({
                      pathname: `/manage/automations`,
                    });
                  }
                }}
              />,
            ]
          : [],
    },
  ];

  return (
    <ProTable<API.ContainerVolume>
      columns={columns}
      request={getVolumes}
      rowKey="name"
      search={{
        filterType: 'light',
      }}
      options={false}
      pagination={{
        defaultPageSize: 20,
        showSizeChanger: true,
      }}
      toolBarRender={() => [<CreateVolumeModal key={'create-volume'} />]}
    />
  );
};

export default Volumes;

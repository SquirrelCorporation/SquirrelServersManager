import ContainerBackUpVolumeModal from '@/pages/Containers/components/sub-components/ContainerBackUpVolumeModal';
import CreateVolumeModal from '@/pages/Containers/components/sub-components/CreateVolumeModal';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getVolumes } from '@/services/rest/containers/container-volumes';
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
      width: '8%',
    },
    {
      title: 'Driver',
      dataIndex: 'driver',
      width: '8%',
    },
    {
      title: 'Mount Point',
      dataIndex: 'mountPoint',
      search: false,
      width: '20%',
      responsive: ['sm'],
      ellipsis: true,
    },
    {
      title: 'Mount Point',
      dataIndex: 'mountPoint',
      search: false,
      width: '20%',
      responsive: ['xs'],
    },
    {
      title: 'Action',
      key: 'option',
      valueType: 'option',
      width: '15%',
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
      rowKey="uuid"
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

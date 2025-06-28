import { ContainerImage } from '@shared/ui/icons/categories/containers';
import ContainerTypeIcon from '@/pages/Containers/components/containers/container-details/ContainerTypeIcon';
import ContainerAvatar from '@/pages/Containers/components/containers/ContainerAvatar';
import StatusTag from '@/pages/Containers/components/containers/StatusTag';
import { capitalizeFirstLetter } from '@/utils/strings';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import { Divider, Tag, Tooltip, Typography } from 'antd';
import moment from 'moment';
import React from 'react';
import { API } from 'ssm-shared-lib';
import { ContainerTypes } from 'ssm-shared-lib/distribution/enums/container';

export type ContainerDetailsProps = {
  container: API.Container & { displayType: ContainerTypes.PROXMOX };
};

const ProxmoxContainerDetails: React.FC<ContainerDetailsProps> = ({
  container,
}) => (
  <ProDescriptions<API.Container & { displayType: ContainerTypes.PROXMOX }>
    style={{ marginBottom: 30 }}
    column={2}
    // bordered
    request={async () => {
      return Promise.resolve({
        success: true,
        data: container,
      });
    }}
    columns={[
      {
        span: 2,
        render: () => (
          <Divider dashed style={{ marginTop: 5, marginBottom: 5 }}>
            <ContainerAvatar row={container} key={container.id} />
            <Typography.Title>{container.name}</Typography.Title>
          </Divider>
        ),
      },
      {
        title: 'Platform',
        key: 'displayType',
        span: 2,
        editable: false,
        render: (_, entity) => (
          <>
            <ContainerTypeIcon displayType={entity.displayType} />{' '}
            {capitalizeFirstLetter(entity.displayType)}{' '}
            {entity.type ? `(${entity.type})` : ``}
          </>
        ),
      },
      {
        title: 'ID',
        key: 'id',
        dataIndex: 'id',
        editable: false,
      },
      {
        title: 'Node',
        key: 'node',
        dataIndex: 'node',
        editable: false,
      },
      {
        title: 'Status',
        key: 'status',
        editable: false,
        render: (_, entity) => (
          <>
            <StatusTag status={entity.status} />
            <Tooltip
              title={`Updated At: ${entity.updatedAt ? moment(entity.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'Unknown'}`}
            >
              <Tag icon={<InfoCircleOutlined />} />
            </Tooltip>
          </>
        ),
      },
      {
        title: 'On',
        key: 'device',
        editable: false,
        render: (_, entity) => (
          <Tooltip key={'fqdn'} title={entity?.device?.fqdn}>
            <Tag color="black">{entity.device?.ip}</Tag>
          </Tooltip>
        ),
      },
      {
        key: 'image-sep',
        span: 2,
        render: () => (
          <Divider dashed style={{ marginTop: 5, marginBottom: 5 }}>
            <ContainerImage style={{ marginRight: 4 }} />
            <Typography.Text> Image</Typography.Text>
          </Divider>
        ),
      },
      {
        title: 'Architecture',
        key: 'architecture',
        dataIndex: ['config', 'arch'],
        editable: false,
      },
      {
        title: 'OS',
        key: 'os',
        dataIndex: ['config', 'ostype'],
        editable: false,
      },
    ]}
  />
);
export default ProxmoxContainerDetails;

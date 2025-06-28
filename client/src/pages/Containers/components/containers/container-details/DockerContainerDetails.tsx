import {
  ContainerImage,
  PortInput,
} from '@shared/ui/icons/categories/containers';
import {
  ElNetwork,
} from '@shared/ui/icons/categories/system';
import {
  ExternalLink,
} from '@shared/ui/icons/categories/ui';
import RegistryLogo from '@/components/RegistryComponents/RegistryLogo';
import ContainerTypeIcon from '@/pages/Containers/components/containers/container-details/ContainerTypeIcon';
import ContainerAvatar from '@/pages/Containers/components/containers/ContainerAvatar';
import StatusTag from '@/pages/Containers/components/containers/StatusTag';
import { capitalizeFirstLetter } from '@/utils/strings';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import {
  Avatar,
  Col,
  Divider,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import React from 'react';
import { API } from 'ssm-shared-lib';
import { ContainerTypes } from 'ssm-shared-lib/distribution/enums/container';

export type ContainerDetailsProps = {
  container: API.Container & { displayType: ContainerTypes.DOCKER };
};

const DockerContainerDetails: React.FC<ContainerDetailsProps> = ({
  container,
}) => (
  <ProDescriptions<API.Container & { displayType: ContainerTypes.DOCKER }>
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
            {capitalizeFirstLetter(entity.displayType)}
          </>
        ),
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
        key: 'registry',
        editable: false,
        span: 2,
        render: (_, entity) => {
          return (
            <Row>
              <Col>
                <Avatar
                  size={50}
                  shape="square"
                  style={{
                    marginRight: 4,
                    backgroundColor: 'rgba(41,70,147,0.51)',
                  }}
                  src={
                    <RegistryLogo
                      provider={entity?.image?.registry.name as string}
                    />
                  }
                />
              </Col>
              <Col
                style={{
                  marginLeft: 10,
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
              >
                <Tag>{entity?.image?.registry.name} </Tag>
                <Tag>{entity?.image?.registry.url}</Tag>
              </Col>
            </Row>
          );
        },
      },
      {
        title: 'Image',
        key: 'image',
        dataIndex: ['image', 'name'],
        editable: false,
      },
      {
        title: 'Version',
        key: 'version',
        dataIndex: ['image', 'tag', 'value'],
        editable: false,
      },
      {
        title: 'Architecture',
        key: 'architecture',
        dataIndex: ['image', 'architecture'],
        editable: false,
      },
      {
        title: 'OS',
        key: 'os',
        dataIndex: ['image', 'os'],
        editable: false,
      },
      {
        title: 'Update',
        key: 'update',
        editable: false,
        span: 2,
        render: (_, entity) => (
          <>
            {(entity.updateAvailable && (
              <Space size={'small'}>
                <Tag color="cyan">Update Available</Tag>
                <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                  Update Kind:
                </Typography.Text>
                <Tag>{entity.updateKind?.kind}</Tag>
                {entity.updateKind?.kind !== 'digest' && (
                  <>
                    <Typography.Text
                      style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                    >
                      Version:
                    </Typography.Text>
                    <Tag>
                      {' '}
                      <Typography.Text
                        ellipsis={{
                          tooltip: entity.updateKind?.localValue,
                        }}
                        style={{ maxWidth: 100, fontSize: 'inherit' }}
                      >
                        {entity.updateKind?.localValue || 'Unknown'}
                      </Typography.Text>
                    </Tag>
                    ➔
                    <Tag>
                      <Typography.Text
                        ellipsis={{
                          tooltip: entity.updateKind?.remoteValue,
                        }}
                        style={{ maxWidth: 100, fontSize: 'inherit' }}
                      >
                        {entity.updateKind?.remoteValue || 'Unknown'}
                      </Typography.Text>
                    </Tag>
                    {entity.updateKind?.semverDiff ? (
                      <Tag>{entity.updateKind?.semverDiff}</Tag>
                    ) : (
                      ''
                    )}
                  </>
                )}
              </Space>
            )) ||
              'No'}
          </>
        ),
      },
      {
        key: 'ports-sep',
        span: 2,
        render: () => (
          <Divider dashed style={{ marginTop: 5, marginBottom: 5 }}>
            <PortInput style={{ marginRight: 4 }} />
            <Typography.Text> Ports</Typography.Text>
          </Divider>
        ),
      },
      {
        key: 'ports',
        title: 'Bindings',
        span: 2,
        render: (_, entity) =>
          (entity?.ports?.length &&
            entity?.ports?.length > 0 &&
            entity?.ports
              ?.filter((e) => e.IP === '0.0.0.0')
              ?.map((e) => (
                <a
                  key={`port-${e.PublicPort}-${e.PrivatePort}`}
                  href={`http://${entity?.device?.ip}:${e.PublicPort}`}
                >
                  <Tag icon={<ExternalLink />}>
                    {e.PublicPort}:{e.PrivatePort}
                  </Tag>
                </a>
              ))) ||
          'None',
      },
      {
        key: 'networks-sep',
        span: 2,
        render: () => (
          <Divider dashed style={{ marginTop: 5, marginBottom: 5 }}>
            <ElNetwork style={{ marginRight: 4 }} />
            <Typography.Text> Networks</Typography.Text>
          </Divider>
        ),
      },
      {
        key: 'networks',
        title: 'Networks',
        span: 2,
        render: (_, entity) =>
          entity?.networkSettings?.Networks
            ? Object.keys(entity.networkSettings.Networks).map((e, index) => (
                <>
                  <Tag key={e}>{e}</Tag>(
                  {
                    Object.values(entity?.networkSettings?.Networks || [])?.[
                      index
                    ]?.IPAddress
                  }
                  )
                </>
              ))
            : 'None',
      },
    ]}
  />
);
export default DockerContainerDetails;

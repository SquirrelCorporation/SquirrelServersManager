import {
  ContainerImage,
  Details,
  ElNetwork,
  ExternalLink,
  Live24Filled,
  PortInput,
} from '@/components/Icons/CustomIcons';
import RegistryLogo from '@/components/RegistryComponents/RegistryLogo';
import ContainerAvatar from '@/pages/Containers/components/containers/ContainerAvatar';
import StatusTag from '@/pages/Containers/components/containers/StatusTag';
import { postContainerAction } from '@/services/rest/containers';
import {
  CloseCircleOutlined,
  InfoCircleOutlined,
  PauseOutlined,
  PlayCircleFilled,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Avatar,
  Button,
  Col,
  Divider,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import React from 'react';
import { API, SsmContainer } from 'ssm-shared-lib';

type ContainerDetailsModalProps = {
  selectedRecord?: API.Container;
  setOpenModal: (open: boolean) => void;
  isOpen: boolean;
};

const ContainerDetailsModal: React.FC<ContainerDetailsModalProps> = ({
  setOpenModal,
  isOpen,
  selectedRecord,
}) => {
  if (!selectedRecord) {
    return;
  }
  const handleAction = async (action: SsmContainer.Actions) => {
    await postContainerAction(selectedRecord?.id as string, action).then(() => {
      message.info({
        content: `Container : ${action}`,
      });
    });
  };

  return (
    <Modal
      open={isOpen}
      onOk={() => setOpenModal(false)}
      onCancel={() => setOpenModal(false)}
      title={
        <>
          <Details /> Container Details
        </>
      }
      destroyOnClose
      width={800}
      footer={(_, extra) => (
        <>
          <Button.Group style={{ marginRight: 15 }}>
            <Button
              icon={<Live24Filled />}
              onClick={() => {
                history.push({
                  pathname: `/manage/containers/logs/${selectedRecord?.id}`,
                });
              }}
            >
              Live Logs
            </Button>
            <Button
              icon={<StopOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.STOP)}
            >
              Stop
            </Button>
            <Button
              icon={<PlayCircleFilled />}
              onClick={() => handleAction(SsmContainer.Actions.START)}
            >
              Start
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.RESTART)}
            >
              Restart
            </Button>
            <Button
              icon={<PauseOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.PAUSE)}
            >
              Pause
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.KILL)}
            >
              Kill
            </Button>
          </Button.Group>
          <extra.OkBtn />
        </>
      )}
    >
      <ProDescriptions<API.Container>
        style={{ marginBottom: 30 }}
        column={2}
        // bordered
        request={async () => {
          return Promise.resolve({
            success: true,
            data: selectedRecord,
          });
        }}
        columns={[
          {
            span: 2,
            render: () => (
              <Divider dashed style={{ marginTop: 5, marginBottom: 5 }}>
                <ContainerAvatar row={selectedRecord} key={selectedRecord.id} />
                <Typography.Title> {selectedRecord.name}</Typography.Title>
              </Divider>
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
                    <Typography.Text
                      style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                    >
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
                        <Tag>{entity.updateKind?.localValue || 'Unknown'}</Tag>➔
                        <Tag>{entity.updateKind?.remoteValue || 'Unknown'}</Tag>
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
                )) || 'None',
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
                ? Object.keys(entity.networkSettings.Networks).map(
                    (e, index) => (
                      <>
                        <Tag key={e}>{e}</Tag>(
                        {
                          Object.values(
                            entity?.networkSettings?.Networks || [],
                          )?.[index]?.IPAddress
                        }
                        )
                      </>
                    ),
                  )
                : 'None',
          },
        ]}
      />
      <Divider dashed />
    </Modal>
  );
};

export default ContainerDetailsModal;

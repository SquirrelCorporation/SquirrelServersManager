import {
  ContainerImage,
  ElNetwork,
  Live24Filled,
  PortInput,
} from '@/components/Icons/CustomIcons';
import RegistryLogo from '@/components/RegistryComponents/RegistryLogo';
import ContainerAvatar from '@/pages/Containers/components/containers/ContainerAvatar';
import StatusTag from '@/pages/Containers/components/containers/StatusTag';
import {
  CloseCircleOutlined,
  InfoCircleOutlined,
  PauseOutlined,
  PlayCircleFilled,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import {
  Avatar,
  Col,
  Divider,
  Modal,
  Row,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import React from 'react';
import { API } from 'ssm-shared-lib';

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
  return (
    <Modal
      open={isOpen}
      onCancel={() => setOpenModal(false)}
      title={'Container Details'}
      destroyOnClose
      width={800}
    >
      <ProDescriptions<API.Container>
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
            //title: 'Registry',
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
                        <RegistryLogo provider={entity?.image?.registry.name} />
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
            key: 'ports-sep',
            span: 2,
            render: () => (
              <Divider dashed style={{ marginTop: 0, marginBottom: 0 }}>
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
                  <Tag key={`port-${e.PublicPort}-${e.PrivatePort}`}>
                    {e.PublicPort}:{e.PrivatePort}
                  </Tag>
                )) || 'None',
          },
          {
            key: 'networks-sep',
            span: 2,
            render: () => (
              <Divider dashed style={{ marginTop: 0, marginBottom: 0 }}>
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
                        <Tag key={e}>{e}</Tag>
                        IP:
                        {
                          Object.values(entity.networkSettings.Networks)[index]
                            ?.IPAddress
                        }
                      </>
                    ),
                  )
                : 'None',
          },
        ]}
      />
      <>
        <a target="_blank" rel="noopener noreferrer" key="link">
          <Live24Filled /> Live Logs
        </a>
        ,
        <a target="_blank" rel="noopener noreferrer" key="warning">
          <StopOutlined /> Stop
        </a>
        ,
        <a target="_blank" rel="noopener noreferrer" key="view">
          <PlayCircleFilled /> Start
        </a>
        ,
        <a target="_blank" rel="noopener noreferrer" key="view">
          <SwapOutlined /> Restart
        </a>
        ,
        <a target="_blank" rel="noopener noreferrer" key="view">
          <PauseOutlined /> Pause
        </a>
        ,
        <a target="_blank" rel="noopener noreferrer" key="view">
          <CloseCircleOutlined /> Kill
        </a>
        ,
      </>
    </Modal>
  );
};

export default ContainerDetailsModal;

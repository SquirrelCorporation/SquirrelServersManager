import React from 'react';
import { Modal, Descriptions, Tag, Space, Typography, Spin, Alert, Tabs, Table } from 'antd';
import { 
  ContainerOutlined, 
  CalendarOutlined, 
  DatabaseOutlined,
  TagOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { useImageDetails } from '../../../model/images-queries';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface ImageDetailsModalProps {
  imageId: string;
  visible: boolean;
  onClose: () => void;
}

export const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({
  imageId,
  visible,
  onClose,
}) => {
  const { data: imageDetails, isLoading, error } = useImageDetails(imageId, visible);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (!imageDetails && !isLoading && !error) {
    return null;
  }

  const historyColumns = [
    {
      title: 'Layer ID',
      dataIndex: 'id',
      key: 'id',
      width: '20%',
      render: (id: string) => (
        <Text code style={{ fontSize: '11px' }}>
          {id.slice(0, 12)}...
        </Text>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: '25%',
      render: (created: Date) => formatDate(created),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: '15%',
      render: (size: number) => formatSize(size),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: '40%',
      render: (createdBy: string) => (
        <Text style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {createdBy.length > 60 ? `${createdBy.slice(0, 57)}...` : createdBy}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined />
          <span>Image Details</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading image details...</div>
        </div>
      )}

      {error && (
        <Alert
          message="Failed to load image details"
          description={error.message}
          type="error"
          showIcon
        />
      )}

      {imageDetails && (
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Repository">
                <Text strong>{imageDetails.repository}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tag">
                <Tag color="blue">{imageDetails.tag}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Image ID">
                <Text code>{imageDetails.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                <Space>
                  <DatabaseOutlined />
                  <Text strong>{formatSize(imageDetails.size)}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDate(imageDetails.created)}</Text>
                </Space>
              </Descriptions.Item>
              {imageDetails.architecture && (
                <Descriptions.Item label="Architecture">
                  <Tag>{imageDetails.architecture}</Tag>
                  {imageDetails.os && <Tag style={{ marginLeft: 8 }}>{imageDetails.os}</Tag>}
                </Descriptions.Item>
              )}
              {imageDetails.digest && (
                <Descriptions.Item label="Digest">
                  <Text code style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                    {imageDetails.digest}
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Usage">
                <Space>
                  <ContainerOutlined />
                  <Text>
                    {imageDetails.inUse 
                      ? `Used by ${imageDetails.containers?.length || 0} container(s)`
                      : 'Not currently in use'
                    }
                  </Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {imageDetails.containers && imageDetails.containers.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>
                  <ContainerOutlined style={{ marginRight: 8 }} />
                  Containers Using This Image
                </Title>
                <Space wrap>
                  {imageDetails.containers.map(container => (
                    <Tag 
                      key={container.id} 
                      color={container.status === 'running' ? 'green' : 'orange'}
                    >
                      {container.name} ({container.status})
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </TabPane>

          <TabPane tab="Labels" key="labels">
            {imageDetails.labels && Object.keys(imageDetails.labels).length > 0 ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <Text type="secondary">
                    Image labels provide metadata about the image content and build information.
                  </Text>
                </div>
                <Descriptions column={1} bordered size="small">
                  {Object.entries(imageDetails.labels).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      <Text code>{value}</Text>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <TagOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: 16, color: '#666' }}>
                  No labels found for this image
                </div>
              </div>
            )}
          </TabPane>

          <TabPane tab="History" key="history">
            {imageDetails.history && imageDetails.history.length > 0 ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <Text type="secondary">
                    Image build history shows the layers and commands used to create this image.
                  </Text>
                </div>
                <Table
                  columns={historyColumns}
                  dataSource={imageDetails.history}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CalendarOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: 16, color: '#666' }}>
                  No history information available for this image
                </div>
              </div>
            )}
          </TabPane>
        </Tabs>
      )}
    </Modal>
  );
};
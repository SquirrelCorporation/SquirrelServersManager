import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Space, Button, Tabs, List, Typography, Statistic, Row, Col, Divider } from 'antd';
import { 
  HddOutlined, 
  ContainerOutlined, 
  ClockCircleOutlined, 
  InfoCircleOutlined,
  FolderOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useVolumeDetails, useVolumeBackups } from '../../../model/volumes-queries';
import { useSelectedDevice } from '@shared/store/device-store';
import { VolumeBackupModal } from './VolumeBackupModal';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface VolumeDetailsModalProps {
  volumeName: string;
  visible: boolean;
  onClose: () => void;
}

export const VolumeDetailsModal: React.FC<VolumeDetailsModalProps> = ({
  volumeName,
  visible,
  onClose,
}) => {
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const { device } = useSelectedDevice();
  
  const { data: volumeDetails, isLoading, refetch } = useVolumeDetails(
    volumeName, 
    device?.uuid, 
    visible
  );
  
  const { data: backups = [] } = useVolumeBackups(device?.uuid, volumeName);

  const formatSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'Unknown';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getDriverColor = (driver: string) => {
    switch (driver) {
      case 'local': return 'default';
      case 'overlay2': return 'blue';
      case 'nfs': return 'green';
      case 'tmpfs': return 'orange';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Modal
        title="Volume Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center', padding: 40 }}>
          Loading volume details...
        </div>
      </Modal>
    );
  }

  if (!volumeDetails) {
    return (
      <Modal
        title="Volume Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center', padding: 40 }}>
          Volume not found
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        title={
          <Space>
            <HddOutlined />
            Volume Details - {volumeName}
          </Space>
        }
        open={visible}
        onCancel={onClose}
        footer={
          <Space>
            <Button onClick={onClose}>Close</Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => setBackupModalVisible(true)}
            >
              Create Backup
            </Button>
          </Space>
        }
        width={900}
        destroyOnClose
      >
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            <Row gutter={24}>
              <Col span={12}>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Name">
                    <Text strong>{volumeDetails.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Driver">
                    <Tag color={getDriverColor(volumeDetails.driver)}>
                      {volumeDetails.driver.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mountpoint">
                    <Text code>{volumeDetails.mountpoint}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Scope">
                    <Tag color={volumeDetails.scope === 'local' ? 'default' : 'blue'}>
                      {volumeDetails.scope.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    <Space>
                      <ClockCircleOutlined />
                      {formatDate(volumeDetails.created)}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={volumeDetails.inUse ? 'success' : 'default'}>
                      {volumeDetails.inUse ? 'In Use' : 'Unused'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              
              <Col span={12}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Volume Size"
                      value={formatSize(volumeDetails.size)}
                      prefix={<HddOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Used Space"
                      value={formatSize(volumeDetails.usage?.size)}
                      prefix={<FolderOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Files"
                      value={volumeDetails.usage?.files || 0}
                      prefix={<InfoCircleOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Directories"
                      value={volumeDetails.usage?.directories || 0}
                      prefix={<FolderOutlined />}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={`Containers (${volumeDetails.containers?.length || 0})`} key="containers">
            {volumeDetails.containers && volumeDetails.containers.length > 0 ? (
              <List
                dataSource={volumeDetails.containers}
                renderItem={(container) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ContainerOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                      title={
                        <Space>
                          <Text strong>{container.name}</Text>
                          <Tag color={container.mode === 'rw' ? 'green' : 'orange'}>
                            {container.mode.toUpperCase()}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Text>ID: <Text code>{container.id}</Text></Text>
                          <Text>Mount Path: <Text code>{container.mountPath}</Text></Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                <ContainerOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>No containers are using this volume</div>
              </div>
            )}
          </TabPane>

          <TabPane tab="Labels" key="labels">
            {volumeDetails.labels && Object.keys(volumeDetails.labels).length > 0 ? (
              <Descriptions column={1} bordered size="small">
                {Object.entries(volumeDetails.labels).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    <Text code>{value}</Text>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                No labels defined for this volume
              </div>
            )}
          </TabPane>

          <TabPane tab="Options" key="options">
            {volumeDetails.options && Object.keys(volumeDetails.options).length > 0 ? (
              <Descriptions column={1} bordered size="small">
                {Object.entries(volumeDetails.options).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    <Text code>{value}</Text>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                No driver options configured for this volume
              </div>
            )}
          </TabPane>

          <TabPane tab={`Backups (${backups.length})`} key="backups">
            {backups.length > 0 ? (
              <List
                dataSource={backups}
                renderItem={(backup) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<SaveOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                      title={
                        <Space>
                          <Text strong>{backup.backupName}</Text>
                          <Tag color={backup.status === 'completed' ? 'success' : 
                                    backup.status === 'failed' ? 'error' : 'processing'}>
                            {backup.status.toUpperCase()}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Text>Size: {formatSize(backup.size)}</Text>
                          <Text>Created: {formatDate(backup.created)}</Text>
                          {backup.error && (
                            <Text type="danger">Error: {backup.error}</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                <SaveOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>No backups found for this volume</div>
                <Button 
                  type="primary" 
                  style={{ marginTop: 16 }}
                  onClick={() => setBackupModalVisible(true)}
                >
                  Create First Backup
                </Button>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Modal>

      <VolumeBackupModal
        visible={backupModalVisible}
        onClose={() => setBackupModalVisible(false)}
        volumeName={volumeName}
        deviceUuid={device?.uuid}
      />
    </>
  );
};
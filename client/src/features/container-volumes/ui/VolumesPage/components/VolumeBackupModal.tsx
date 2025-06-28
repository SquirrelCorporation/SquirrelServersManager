import React, { useState } from 'react';
import { Modal, Form, Input, Switch, message, Space, Progress, List, Typography, Button, Popconfirm } from 'antd';
import { SaveOutlined, ReloadOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useBackupVolume, useVolumeBackups, useRestoreVolume, useDeleteBackup, useBackupStatus } from '../../../model/volumes-queries';
import { VolumeBackupRequest, VolumeBackup } from '@shared/api/containers';

const { Text, Title } = Typography;

interface VolumeBackupModalProps {
  visible: boolean;
  onClose: () => void;
  volumeName: string;
  deviceUuid?: string;
}

export const VolumeBackupModal: React.FC<VolumeBackupModalProps> = ({
  visible,
  onClose,
  volumeName,
  deviceUuid,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  
  const backupVolume = useBackupVolume();
  const { data: backups = [], isLoading: backupsLoading } = useVolumeBackups(deviceUuid, volumeName);
  const restoreVolume = useRestoreVolume();
  const deleteBackup = useDeleteBackup();

  const handleCreateBackup = async (values: any) => {
    if (!deviceUuid) {
      message.error('No device selected');
      return;
    }

    try {
      const request: VolumeBackupRequest = {
        deviceUuid,
        volumeName,
        backupName: values.backupName,
        compression: values.compression || false,
      };

      await backupVolume.mutateAsync(request);
      
      message.success(`Backup for volume "${volumeName}" started successfully`);
      form.resetFields();
      setActiveTab('manage');
    } catch (error: any) {
      message.error(error.message || 'Failed to create backup');
    }
  };

  const handleRestore = async (backupId: string, targetVolumeName?: string) => {
    try {
      await restoreVolume.mutateAsync({ backupId, targetVolumeName });
      message.success('Volume restore started successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to restore volume');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await deleteBackup.mutateAsync(backupId);
      message.success('Backup deleted successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to delete backup');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: VolumeBackup['status']) => {
    switch (status) {
      case 'completed': return '#52c41a';
      case 'failed': return '#ff4d4f';
      case 'in_progress': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = (status: VolumeBackup['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SaveOutlined />
          Volume Backup - {volumeName}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            type={activeTab === 'create' ? 'primary' : 'default'}
            onClick={() => setActiveTab('create')}
          >
            Create Backup
          </Button>
          <Button
            type={activeTab === 'manage' ? 'primary' : 'default'}
            onClick={() => setActiveTab('manage')}
          >
            Manage Backups ({backups.length})
          </Button>
        </Space>
      </div>

      {activeTab === 'create' && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBackup}
          initialValues={{
            backupName: `${volumeName}-${new Date().toISOString().split('T')[0]}`,
            compression: true,
          }}
        >
          <Form.Item
            name="backupName"
            label="Backup Name"
            rules={[{ required: true, message: 'Backup name is required' }]}
            extra="Unique name for this backup"
          >
            <Input placeholder="Enter backup name" />
          </Form.Item>

          <Form.Item
            name="compression"
            valuePropName="checked"
            extra="Enable compression to reduce backup size (recommended)"
          >
            <Switch checkedChildren="Compressed" unCheckedChildren="Uncompressed" />
          </Form.Item>

          <div style={{ 
            background: '#f6f8fa', 
            padding: 12, 
            borderRadius: 6, 
            fontSize: '12px',
            color: '#666',
            marginBottom: 16
          }}>
            <strong>Note:</strong> Backup process will create a point-in-time snapshot of the volume data. 
            The volume will remain accessible during backup.
          </div>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={backupVolume.isLoading}
                icon={<SaveOutlined />}
              >
                Create Backup
              </Button>
              <Button onClick={onClose}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      {activeTab === 'manage' && (
        <div>
          <Title level={5}>Existing Backups</Title>
          
          {backupsLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              Loading backups...
            </div>
          ) : backups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              No backups found for this volume
            </div>
          ) : (
            <List
              dataSource={backups}
              renderItem={(backup) => (
                <List.Item
                  actions={[
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => handleRestore(backup.id)}
                      disabled={backup.status !== 'completed'}
                      loading={restoreVolume.isLoading}
                    >
                      Restore
                    </Button>,
                    <Popconfirm
                      title="Delete this backup?"
                      description="This action cannot be undone."
                      onConfirm={() => handleDeleteBackup(backup.id)}
                      okText="Delete"
                      okType="danger"
                      cancelText="Cancel"
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deleteBackup.isLoading}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{backup.backupName}</Text>
                        <Text 
                          style={{ 
                            color: getStatusColor(backup.status),
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        >
                          {getStatusText(backup.status)}
                        </Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <ClockCircleOutlined />
                          <Text style={{ fontSize: '12px' }}>
                            Created: {formatDate(backup.created)}
                          </Text>
                        </Space>
                        <Space>
                          <Text style={{ fontSize: '12px' }}>
                            Size: {formatSize(backup.size)}
                          </Text>
                          {backup.status === 'in_progress' && backup.progress && (
                            <Progress 
                              percent={backup.progress} 
                              size="small" 
                              style={{ width: 100 }}
                            />
                          )}
                        </Space>
                        {backup.error && (
                          <Text type="danger" style={{ fontSize: '12px' }}>
                            Error: {backup.error}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      )}
    </Modal>
  );
};
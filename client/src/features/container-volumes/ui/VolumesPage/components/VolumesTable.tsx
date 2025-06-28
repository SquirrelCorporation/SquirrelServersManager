import React from 'react';
import { Space, Tag, Tooltip, Button, Typography, Progress } from 'antd';
import { 
  DeleteOutlined, 
  SaveOutlined, 
  InfoCircleOutlined,
  ContainerOutlined,
  ClockCircleOutlined,
  HddOutlined
} from '@ant-design/icons';
import { DataTable } from '@shared/ui/patterns';
import { ContainerVolume } from '@shared/api/containers';
import { useVolumeSelection } from '../../../model/volumes-store';
import { useDeleteVolume } from '../../../model/volumes-queries';

const { Text } = Typography;

interface VolumesTableProps {
  data: ContainerVolume[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  onVolumeClick: (volumeName: string) => void;
  search: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
  };
}

export const VolumesTable: React.FC<VolumesTableProps> = ({
  data,
  loading,
  error,
  selectedIds,
  onVolumeClick,
  search,
}) => {
  const { toggleSelection } = useVolumeSelection();
  const deleteVolume = useDeleteVolume();

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUsageColor = (inUse: boolean, containerCount?: number) => {
    if (!inUse) return '#d9d9d9';
    if (containerCount && containerCount > 3) return '#ff4d4f';
    if (containerCount && containerCount > 1) return '#faad14';
    return '#52c41a';
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

  const handleDelete = async (volumeName: string, deviceUuid: string) => {
    try {
      await deleteVolume.mutateAsync({ volumeName, deviceUuid, force: false });
    } catch (error) {
      console.error('Failed to delete volume:', error);
    }
  };

  const columns = [
    {
      title: 'Volume Name',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (name: string, record: ContainerVolume) => (
        <div>
          <div style={{ 
            fontWeight: 500, 
            cursor: 'pointer',
            color: '#1890ff' 
          }}
          onClick={() => onVolumeClick(name)}>
            <HddOutlined style={{ marginRight: 8 }} />
            {name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.mountpoint}
          </div>
        </div>
      ),
    },
    {
      title: 'Driver',
      dataIndex: 'driver',
      key: 'driver',
      width: '12%',
      render: (driver: string) => (
        <Tag color={getDriverColor(driver)}>
          {driver.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: '12%',
      render: (size?: number) => (
        <Text style={{ fontFamily: 'monospace' }}>
          {formatSize(size)}
        </Text>
      ),
    },
    {
      title: 'Usage',
      dataIndex: 'inUse',
      key: 'usage',
      width: '15%',
      render: (inUse: boolean, record: ContainerVolume) => {
        const containerCount = record.containers?.length || 0;
        return (
          <Space direction="vertical" size={4}>
            <Tag 
              color={getUsageColor(inUse, containerCount)}
              icon={<ContainerOutlined />}
            >
              {inUse ? 'In Use' : 'Unused'}
            </Tag>
            {containerCount > 0 && (
              <Text style={{ fontSize: '12px', color: '#666' }}>
                {containerCount} container{containerCount > 1 ? 's' : ''}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      key: 'scope',
      width: '10%',
      render: (scope: string) => (
        <Tag color={scope === 'local' ? 'default' : 'blue'}>
          {scope.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: '15%',
      render: (created: Date) => (
        <Tooltip title={formatDate(created)}>
          <Space>
            <ClockCircleOutlined style={{ color: '#666' }} />
            <Text style={{ fontSize: '12px' }}>
              {formatDate(created)}
            </Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '11%',
      render: (_, record: ContainerVolume) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => onVolumeClick(record.name)}
            />
          </Tooltip>
          <Tooltip title="Backup Volume">
            <Button
              type="text"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => {
                // This will be handled by the parent component
                // through the backup action in quick actions
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Volume">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.name, record.deviceUuid)}
              loading={deleteVolume.isLoading}
              disabled={record.inUse}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: Array.from(selectedIds),
    onChange: (selectedRowKeys: React.Key[]) => {
      // Clear current selection and add new ones
      selectedIds.forEach(id => {
        if (!selectedRowKeys.includes(id)) {
          toggleSelection(id);
        }
      });
      selectedRowKeys.forEach(key => {
        if (!selectedIds.has(key as string)) {
          toggleSelection(key as string);
        }
      });
    },
    getCheckboxProps: (record: ContainerVolume) => ({
      name: record.name,
    }),
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      rowKey="name"
      rowSelection={rowSelection}
      search={search}
      emptyProps={{
        description: 'No volumes found',
        action: 'Create your first volume to get started',
      }}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} volumes`,
      }}
    />
  );
};
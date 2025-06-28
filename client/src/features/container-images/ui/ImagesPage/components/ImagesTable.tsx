import React from 'react';
import { Space, Tag, Tooltip, Button, Typography, Progress } from 'antd';
import { 
  DeleteOutlined, 
  DownloadOutlined, 
  InfoCircleOutlined,
  ContainerOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { DataTable } from '@shared/ui/patterns';
import { ContainerImage } from '@shared/api/containers';
import { useImageSelection } from '../../../model/images-store';
import { useDeleteImage, useExportImage } from '../../../model/images-queries';

const { Text } = Typography;

interface ImagesTableProps {
  data: ContainerImage[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  onImageClick: (imageId: string) => void;
  search: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
  };
}

export const ImagesTable: React.FC<ImagesTableProps> = ({
  data,
  loading,
  error,
  selectedIds,
  onImageClick,
  search,
}) => {
  const { toggleSelection } = useImageSelection();
  const deleteImage = useDeleteImage();
  const exportImage = useExportImage();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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

  const getUsageColor = (inUse: boolean, containerCount: number) => {
    if (!inUse) return '#d9d9d9';
    if (containerCount > 3) return '#ff4d4f';
    if (containerCount > 1) return '#faad14';
    return '#52c41a';
  };

  const handleDelete = async (imageId: string, imageName: string) => {
    try {
      await deleteImage.mutateAsync({ imageId, force: false });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleExport = async (imageId: string) => {
    try {
      await exportImage.mutateAsync(imageId);
    } catch (error) {
      console.error('Failed to export image:', error);
    }
  };

  const columns = [
    {
      title: 'Repository',
      dataIndex: 'repository',
      key: 'repository',
      width: '30%',
      render: (repository: string, record: ContainerImage) => (
        <div>
          <div style={{ 
            fontWeight: 500, 
            cursor: 'pointer',
            color: '#1890ff' 
          }}
          onClick={() => onImageClick(record.id)}>
            {repository}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.id.slice(0, 12)}...
          </div>
        </div>
      ),
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      width: '15%',
      render: (tag: string) => (
        <Tag color={tag === 'latest' ? 'blue' : 'default'}>
          {tag}
        </Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: '12%',
      sorter: (a: ContainerImage, b: ContainerImage) => a.size - b.size,
      render: (size: number) => (
        <Text strong>{formatSize(size)}</Text>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      width: '15%',
      render: (_, record: ContainerImage) => {
        const containerCount = record.containers?.length || 0;
        const color = getUsageColor(record.inUse, containerCount);
        
        return (
          <Space direction="vertical" size={0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div 
                style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: color 
                }}
              />
              <Text style={{ color }}>
                {record.inUse ? 'In Use' : 'Unused'}
              </Text>
            </div>
            {record.containers && record.containers.length > 0 && (
              <Tooltip 
                title={
                  <div>
                    <div>Used by {containerCount} container(s):</div>
                    {record.containers.slice(0, 3).map(container => (
                      <div key={container.id}>• {container.name}</div>
                    ))}
                    {containerCount > 3 && <div>• ... and {containerCount - 3} more</div>}
                  </div>
                }
              >
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  <ContainerOutlined style={{ marginRight: 4 }} />
                  {containerCount} container{containerCount !== 1 ? 's' : ''}
                </Text>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: '15%',
      sorter: (a: ContainerImage, b: ContainerImage) => 
        new Date(a.created).getTime() - new Date(b.created).getTime(),
      render: (created: Date) => (
        <Tooltip title={formatDate(created)}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {formatDate(created)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '13%',
      render: (_, record: ContainerImage) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => onImageClick(record.id)}
            />
          </Tooltip>
          <Tooltip title="Export Image">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleExport(record.id)}
              loading={exportImage.isLoading}
            />
          </Tooltip>
          <Tooltip title={record.inUse ? 'Image is in use' : 'Delete Image'}>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, `${record.repository}:${record.tag}`)}
              disabled={record.inUse}
              loading={deleteImage.isLoading}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} images`,
      }}
      searchable={true}
      searchPlaceholder={search.placeholder}
      searchValue={search.value}
      onSearchChange={search.onChange}
      rowSelection={{
        selectedRowKeys: Array.from(selectedIds),
        onChange: (selectedKeys) => {
          // Update selection in store
          const currentSelected = new Set(selectedIds);
          selectedKeys.forEach(key => {
            if (!currentSelected.has(key as string)) {
              toggleSelection(key as string);
            }
          });
          // Remove unselected items
          currentSelected.forEach(key => {
            if (!selectedKeys.includes(key)) {
              toggleSelection(key);
            }
          });
        },
        getCheckboxProps: (record: ContainerImage) => ({
          disabled: false,
        }),
      }}
      scroll={{ x: 800 }}
      size="small"
      expandable={{
        expandedRowRender: (record: ContainerImage) => (
          <div style={{ padding: '12px 0' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {record.labels && Object.keys(record.labels).length > 0 && (
                <div>
                  <Text strong>Labels:</Text>
                  <div style={{ marginTop: 4 }}>
                    {Object.entries(record.labels).map(([key, value]) => (
                      <Tag key={key} style={{ margin: '2px' }}>
                        {key}: {value}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {record.digest && (
                <div>
                  <Text strong>Digest:</Text>
                  <Text code style={{ marginLeft: 8, fontSize: '11px' }}>
                    {record.digest}
                  </Text>
                </div>
              )}
              {record.architecture && (
                <div>
                  <Text strong>Architecture:</Text>
                  <Text style={{ marginLeft: 8 }}>{record.architecture}</Text>
                  {record.os && (
                    <>
                      <Text strong style={{ marginLeft: 16 }}>OS:</Text>
                      <Text style={{ marginLeft: 8 }}>{record.os}</Text>
                    </>
                  )}
                </div>
              )}
            </Space>
          </div>
        ),
        rowExpandable: (record) => 
          !!(record.labels && Object.keys(record.labels).length > 0) ||
          !!record.digest ||
          !!record.architecture,
      }}
    />
  );
};
import React, { useState } from 'react';
import { Card, Space, Button, message, Upload, Modal } from 'antd';
import { 
  ReloadOutlined, 
  DeleteOutlined, 
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { DataTable, QuickActions } from '@shared/ui/patterns';
import { useContainerDevices } from '@shared/store/device-store';
import { useImages, useRefreshImages, useBulkImageActions, useExportImage, useImportImage } from '../../model/images-queries';
import { useImageList, useImageSelection, useImageFilters } from '../../model/images-store';
import { ImagesTable } from './components/ImagesTable';
import { PullImageModal } from './components/PullImageModal';
import { ImageFiltersDrawer } from './components/ImageFiltersDrawer';
import { ImageDetailsModal } from './components/ImageDetailsModal';

export const ImagesPage: React.FC = () => {
  const [pullModalVisible, setPullModalVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Device selection
  const { selected: selectedDevice, devices: containerDevices } = useContainerDevices();

  // Images data and actions
  const { data: imagesData, isLoading } = useImages();
  const { images, loading: storeLoading, error, stats } = useImageList();
  const { selectedIds, selectedImages, clearSelection } = useImageSelection();
  const { filters, setFilters } = useImageFilters();

  // Mutations
  const refreshImages = useRefreshImages();
  const bulkDelete = useBulkImageActions();
  const exportImage = useExportImage();
  const importImage = useImportImage();

  const loading = isLoading || storeLoading || refreshImages.isLoading;

  const handleRefresh = () => {
    refreshImages.mutate();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    Modal.confirm({
      title: 'Delete Selected Images',
      content: `Are you sure you want to delete ${selectedIds.size} selected image(s)? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await bulkDelete.mutateAsync({
            imageIds: Array.from(selectedIds),
            force: false,
          });
          message.success(`${selectedIds.size} image(s) deleted successfully`);
          clearSelection();
        } catch (error) {
          message.error('Failed to delete images');
        }
      },
    });
  };

  const handleExportSelected = async () => {
    if (selectedIds.size !== 1) {
      message.warning('Please select exactly one image to export');
      return;
    }

    const imageId = Array.from(selectedIds)[0];
    try {
      await exportImage.mutateAsync(imageId);
      message.success('Image export started');
    } catch (error) {
      message.error('Failed to export image');
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      await importImage.mutateAsync(file);
      message.success('Image imported successfully');
    } catch (error) {
      message.error('Failed to import image');
    }
  };

  // Quick actions configuration
  const quickActions = [
    {
      key: 'pull',
      label: 'Pull Image',
      icon: <PlusOutlined />,
      onClick: () => setPullModalVisible(true),
      disabled: !selectedDevice,
    },
    {
      key: 'refresh',
      label: 'Refresh',
      icon: <ReloadOutlined />,
      onClick: handleRefresh,
      loading: loading,
    },
    {
      key: 'import',
      label: 'Import',
      icon: <UploadOutlined />,
      component: (
        <Upload
          accept=".tar,.tar.gz"
          showUploadList={false}
          beforeUpload={(file) => {
            handleImportFile(file);
            return false;
          }}
          disabled={!selectedDevice || importImage.isLoading}
        >
          <Button icon={<UploadOutlined />} loading={importImage.isLoading}>
            Import
          </Button>
        </Upload>
      ),
    },
    {
      key: 'export',
      label: 'Export',
      icon: <DownloadOutlined />,
      onClick: handleExportSelected,
      disabled: selectedIds.size !== 1,
      loading: exportImage.isLoading,
    },
    {
      key: 'delete',
      label: 'Delete Selected',
      icon: <DeleteOutlined />,
      onClick: handleBulkDelete,
      disabled: selectedIds.size === 0,
      danger: true,
      loading: bulkDelete.isLoading,
    },
  ];

  const searchConfig = {
    placeholder: 'Search images by repository, tag, or ID...',
    value: filters.search || '',
    onChange: (value: string) => setFilters({ search: value }),
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header with stats and actions */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Container Images
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {stats.total} images • {stats.inUse} in use • {(stats.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB total
              </div>
            </div>
            {selectedDevice && (
              <div style={{ fontSize: '12px', color: '#1890ff' }}>
                Device: {selectedDevice.name}
              </div>
            )}
          </Space>

          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFiltersVisible(true)}
              type={Object.keys(filters).length > 0 ? 'primary' : 'default'}
            >
              Filters
            </Button>
            <QuickActions actions={quickActions} />
          </Space>
        </div>
      </Card>

      {/* Main content */}
      <Card>
        {!selectedDevice ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: 16 }}>
              Please select a device to view container images
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              Available devices: {containerDevices.length}
            </div>
          </div>
        ) : (
          <ImagesTable
            data={images}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            onImageClick={(imageId) => setSelectedImageId(imageId)}
            search={searchConfig}
          />
        )}
      </Card>

      {/* Modals */}
      <PullImageModal
        visible={pullModalVisible}
        onClose={() => setPullModalVisible(false)}
        deviceUuid={selectedDevice?.uuid}
      />

      <ImageFiltersDrawer
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        onFiltersChange={setFilters}
        devices={containerDevices}
      />

      {selectedImageId && (
        <ImageDetailsModal
          imageId={selectedImageId}
          visible={!!selectedImageId}
          onClose={() => setSelectedImageId(null)}
        />
      )}
    </div>
  );
};
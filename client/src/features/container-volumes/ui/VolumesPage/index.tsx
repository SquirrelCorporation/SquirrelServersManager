import React, { useState } from 'react';
import { Card, Space, Button, message, Modal } from 'antd';
import { 
  ReloadOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SaveOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { DataTable, QuickActions } from '@shared/ui/patterns';
import { useContainerDevices } from '@shared/store/device-store';
import { 
  useVolumes, 
  useRefreshVolumes, 
  useBulkVolumeActions, 
  usePruneVolumes,
  useVolumeBackups 
} from '../../model/volumes-queries';
import { useVolumeList, useVolumeSelection, useVolumeFilters } from '../../model/volumes-store';
import { VolumesTable } from './components/VolumesTable';
import { CreateVolumeModal } from './components/CreateVolumeModal';
import { VolumeFiltersDrawer } from './components/VolumeFiltersDrawer';
import { VolumeDetailsModal } from './components/VolumeDetailsModal';
import { VolumeBackupModal } from './components/VolumeBackupModal';

export const VolumesPage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedVolumeName, setSelectedVolumeName] = useState<string | null>(null);
  const [backupModalVisible, setBackupModalVisible] = useState(false);

  // Device selection
  const { selected: selectedDevice, devices: containerDevices } = useContainerDevices();

  // Volumes data and actions
  const { data: volumesData, isLoading } = useVolumes();
  const { volumes, loading: storeLoading, error, stats } = useVolumeList();
  const { selectedIds, selectedVolumes, clearSelection } = useVolumeSelection();
  const { filters, setFilters } = useVolumeFilters();

  // Load backups for stats
  const { data: backupsData } = useVolumeBackups();

  // Mutations
  const refreshVolumes = useRefreshVolumes();
  const bulkDelete = useBulkVolumeActions();
  const pruneVolumes = usePruneVolumes();

  const loading = isLoading || storeLoading || refreshVolumes.isLoading;

  const handleRefresh = () => {
    refreshVolumes.mutate();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    Modal.confirm({
      title: 'Delete Selected Volumes',
      content: `Are you sure you want to delete ${selectedIds.size} selected volume(s)? This action cannot be undone and will permanently remove all data.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await bulkDelete.mutateAsync({
            volumeNames: Array.from(selectedIds),
            force: false,
          });
          message.success(`${selectedIds.size} volume(s) deleted successfully`);
          clearSelection();
        } catch (error) {
          message.error('Failed to delete volumes');
        }
      },
    });
  };

  const handlePruneVolumes = async () => {
    Modal.confirm({
      title: 'Prune Unused Volumes',
      content: 'This will remove all unused volumes. Are you sure you want to continue?',
      okText: 'Prune',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await pruneVolumes.mutateAsync();
          message.success(
            `Pruned ${result.volumesDeleted.length} volumes, ` +
            `reclaimed ${(result.spaceReclaimed / (1024 * 1024 * 1024)).toFixed(2)} GB`
          );
        } catch (error) {
          message.error('Failed to prune volumes');
        }
      },
    });
  };

  const handleBackupSelected = () => {
    if (selectedIds.size !== 1) {
      message.warning('Please select exactly one volume to backup');
      return;
    }
    setBackupModalVisible(true);
  };

  // Quick actions configuration
  const quickActions = [
    {
      key: 'create',
      label: 'Create Volume',
      icon: <PlusOutlined />,
      onClick: () => setCreateModalVisible(true),
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
      key: 'backup',
      label: 'Backup',
      icon: <SaveOutlined />,
      onClick: handleBackupSelected,
      disabled: selectedIds.size !== 1,
    },
    {
      key: 'prune',
      label: 'Prune Unused',
      icon: <ClearOutlined />,
      onClick: handlePruneVolumes,
      disabled: !selectedDevice || stats.unused === 0,
      loading: pruneVolumes.isLoading,
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
    placeholder: 'Search volumes by name, driver, or mountpoint...',
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
                Container Volumes
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {stats.total} volumes • {stats.inUse} in use • {stats.unused} unused • {(stats.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB total
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
              Please select a device to view container volumes
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              Available devices: {containerDevices.length}
            </div>
          </div>
        ) : (
          <VolumesTable
            data={volumes}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            onVolumeClick={(volumeName) => setSelectedVolumeName(volumeName)}
            search={searchConfig}
          />
        )}
      </Card>

      {/* Modals */}
      <CreateVolumeModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        deviceUuid={selectedDevice?.uuid}
      />

      <VolumeFiltersDrawer
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        onFiltersChange={setFilters}
        devices={containerDevices}
      />

      {selectedVolumeName && (
        <VolumeDetailsModal
          volumeName={selectedVolumeName}
          visible={!!selectedVolumeName}
          onClose={() => setSelectedVolumeName(null)}
        />
      )}

      {backupModalVisible && selectedIds.size === 1 && (
        <VolumeBackupModal
          volumeName={Array.from(selectedIds)[0]}
          deviceUuid={selectedDevice?.uuid}
          visible={backupModalVisible}
          onClose={() => setBackupModalVisible(false)}
        />
      )}
    </div>
  );
};
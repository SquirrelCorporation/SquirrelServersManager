/**
 * Device List Component
 * Main component for displaying and managing devices
 */

import React, { useMemo } from 'react';
import { 
  Space, 
  Button, 
  Empty, 
  Row, 
  Col, 
  List, 
  Table, 
  Tag,
  Checkbox,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Device } from '@/shared/lib/device';
import { useDevices } from '../api/queries';
import { useDeviceStore } from '../model/store';
import { useDeviceSelection, useDeviceGroups } from '../model/hooks';
import { DeviceCard } from './DeviceCard';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { DeviceActions } from './DeviceActions';

interface DeviceListProps {
  onCreateDevice?: () => void;
  onEditDevice?: (device: Device) => void;
  onDeleteDevice?: (device: Device) => void;
  onOpenSSH?: (device: Device) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  onCreateDevice,
  onEditDevice,
  onDeleteDevice,
  onOpenSSH,
}) => {
  const { filters, viewMode } = useDeviceStore();
  const { data: devices = [], isLoading, refetch } = useDevices(filters);
  const { 
    selectedDevices, 
    isAllSelected, 
    toggleSelection, 
    selectAll,
    clearSelection 
  } = useDeviceSelection();
  const { groupedByStatus, groupedByType } = useDeviceGroups();
  
  const columns: ColumnsType<Device> = useMemo(() => [
    {
      title: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={selectedDevices.length > 0 && !isAllSelected}
          onChange={selectAll}
        />
      ),
      dataIndex: 'uuid',
      key: 'selection',
      width: 50,
      render: (uuid: string) => (
        <Checkbox
          checked={selectedDevices.some(d => d.uuid === uuid)}
          onChange={() => toggleSelection(uuid)}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Device['status']) => (
        <DeviceStatusBadge status={status} showText />
      ),
      sorter: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>,
      sorter: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'CPU',
      dataIndex: ['stats', 'cpu'],
      key: 'cpu',
      render: (cpu?: number) => cpu ? `${cpu}%` : '-',
      sorter: true,
    },
    {
      title: 'Memory',
      dataIndex: ['stats', 'memory'],
      key: 'memory',
      render: (memory?: number) => memory ? `${memory}%` : '-',
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, device) => (
        <DeviceActions
          device={device}
          onOperation={(op) => message.info(`Operation: ${op}`)}
          onEdit={() => onEditDevice?.(device)}
          onDelete={() => onDeleteDevice?.(device)}
          onOpenSSH={() => onOpenSSH?.(device)}
        />
      ),
    },
  ], [isAllSelected, selectedDevices, selectAll, toggleSelection, onEditDevice, onDeleteDevice, onOpenSSH]);
  
  const renderHeader = () => (
    <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
      <Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateDevice}
        >
          Add Device
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
        {selectedDevices.length > 0 && (
          <>
            <span>{selectedDevices.length} selected</span>
            <Button size="small" onClick={clearSelection}>
              Clear
            </Button>
          </>
        )}
      </Space>
    </Space>
  );
  
  if (devices.length === 0 && !isLoading) {
    return (
      <>
        {renderHeader()}
        <Empty
          description="No devices found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={onCreateDevice}>
            Add Your First Device
          </Button>
        </Empty>
      </>
    );
  }
  
  return (
    <>
      {renderHeader()}
      
      {viewMode === 'grid' && (
        <Row gutter={[16, 16]}>
          {devices.map(device => (
            <Col key={device.uuid} xs={24} sm={12} md={8} lg={6}>
              <DeviceCard
                device={device}
                isSelected={selectedDevices.some(d => d.uuid === device.uuid)}
                onSelect={() => toggleSelection(device.uuid)}
                onEdit={onEditDevice}
                onDelete={onDeleteDevice}
                onOpenSSH={onOpenSSH}
              />
            </Col>
          ))}
        </Row>
      )}
      
      {viewMode === 'list' && (
        <List
          loading={isLoading}
          dataSource={devices}
          renderItem={device => (
            <List.Item
              actions={[
                <DeviceActions
                  key="actions"
                  device={device}
                  onOperation={(op) => message.info(`Operation: ${op}`)}
                  onEdit={() => onEditDevice?.(device)}
                  onDelete={() => onDeleteDevice?.(device)}
                  onOpenSSH={() => onOpenSSH?.(device)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={selectedDevices.some(d => d.uuid === device.uuid)}
                    onChange={() => toggleSelection(device.uuid)}
                  />
                }
                title={
                  <Space>
                    {device.name}
                    <DeviceStatusBadge status={device.status} />
                  </Space>
                }
                description={
                  <Space>
                    <Tag>{device.type}</Tag>
                    {device.ip && <Tag>{device.ip}</Tag>}
                    {device.stats && (
                      <>
                        <span>CPU: {device.stats.cpu}%</span>
                        <span>Memory: {device.stats.memory}%</span>
                      </>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
      
      {viewMode === 'table' && (
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={devices}
          rowKey="uuid"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} devices`,
          }}
        />
      )}
    </>
  );
};
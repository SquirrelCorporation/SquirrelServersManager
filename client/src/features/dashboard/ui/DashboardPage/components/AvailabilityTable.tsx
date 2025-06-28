import React from 'react';
import { Card, Typography, Badge, Space, Empty } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { DataTable } from '@shared/ui/patterns';
import { AvailabilityData } from '../../../api/dashboard';

const { Title } = Typography;

interface AvailabilityTableProps {
  data: AvailabilityData[];
  compact?: boolean;
}

export const AvailabilityTable: React.FC<AvailabilityTableProps> = ({ 
  data, 
  compact = false 
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Title level={4} style={{ margin: '0 0 16px 0' }}>
          Device Availability
        </Title>
        <div style={{ padding: '40px 0' }}>
          <Empty 
            description="No availability data available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </Card>
    );
  }

  const getAvailabilityStatus = (availability: number) => {
    if (availability >= 99) return { status: 'success', text: 'Excellent' };
    if (availability >= 95) return { status: 'processing', text: 'Good' };
    if (availability >= 90) return { status: 'warning', text: 'Fair' };
    return { status: 'error', text: 'Poor' };
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return '#52c41a';
    if (uptime >= 95) return '#1890ff';
    if (uptime >= 90) return '#faad14';
    return '#ff4d4f';
  };

  const formatUptime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const formatLastDowntime = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return '< 1h ago';
  };

  const columns = [
    {
      title: 'Device',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: '25%',
      render: (name: string, record: AvailabilityData) => (
        <Space>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              ID: {record.deviceId.slice(0, 8)}...
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      width: '20%',
      sorter: (a: AvailabilityData, b: AvailabilityData) => a.availability - b.availability,
      render: (availability: number) => {
        const status = getAvailabilityStatus(availability);
        return (
          <Space direction="vertical" size={0}>
            <Badge 
              status={status.status as any} 
              text={`${availability.toFixed(2)}%`}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {status.text}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
      width: '15%',
      sorter: (a: AvailabilityData, b: AvailabilityData) => a.uptime - b.uptime,
      render: (uptime: number) => (
        <div style={{ color: getUptimeColor(uptime), fontWeight: 500 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {formatUptime(uptime)}
        </div>
      ),
    },
    {
      title: 'Incidents',
      dataIndex: 'incidents',
      key: 'incidents',
      width: '15%',
      sorter: (a: AvailabilityData, b: AvailabilityData) => a.incidents - b.incidents,
      render: (incidents: number) => (
        <Space>
          {incidents === 0 ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          )}
          <span style={{ color: incidents === 0 ? '#52c41a' : '#faad14' }}>
            {incidents}
          </span>
        </Space>
      ),
    },
    {
      title: 'Last Downtime',
      dataIndex: 'lastDowntime',
      key: 'lastDowntime',
      width: '25%',
      render: (lastDowntime?: Date) => (
        <span style={{ 
          color: lastDowntime ? '#666' : '#52c41a',
          fontSize: '12px'
        }}>
          {formatLastDowntime(lastDowntime)}
        </span>
      ),
    },
  ];

  const compactColumns = columns.filter(col => 
    ['deviceName', 'availability', 'incidents'].includes(col.key)
  );

  // Calculate summary stats
  const totalDevices = data.length;
  const excellentDevices = data.filter(d => d.availability >= 99).length;
  const poorDevices = data.filter(d => d.availability < 90).length;
  const avgAvailability = data.reduce((sum, d) => sum + d.availability, 0) / totalDevices;

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Device Availability
        </Title>
        {!compact && (
          <Space size="large">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                {excellentDevices}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Excellent</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                {avgAvailability.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Average</div>
            </div>
            {poorDevices > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
                  {poorDevices}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Needs Attention</div>
              </div>
            )}
          </Space>
        )}
      </div>
      
      <DataTable
        data={data}
        columns={compact ? compactColumns : columns}
        pagination={!compact ? { pageSize: 10 } : false}
        searchable={!compact}
        searchPlaceholder="Search devices..."
        size={compact ? 'small' : 'default'}
        scroll={{ y: compact ? 300 : undefined }}
      />
    </Card>
  );
};
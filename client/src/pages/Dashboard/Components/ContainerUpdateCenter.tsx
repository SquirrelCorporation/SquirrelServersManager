import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Space, Badge, Progress, Tag, Modal, message, Tooltip } from 'antd';
import { 
  UpOutlined, 
  DownloadOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  ExclamationTriangleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RollbackOutlined,
  SettingOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';

interface ContainerUpdate {
  id: string;
  containerName: string;
  serviceName: string;
  currentVersion: string;
  latestVersion: string;
  updateType: 'major' | 'minor' | 'patch' | 'security';
  releaseDate: Date;
  size: string;
  changelog?: string;
  securityFixes?: string[];
  status: 'available' | 'updating' | 'updated' | 'failed' | 'rollback';
  progress?: number;
  lastChecked: Date;
}

interface ContainerUpdateCenterProps {
  title?: string;
  cardStyle?: React.CSSProperties;
}

const ContainerUpdateCenter: React.FC<ContainerUpdateCenterProps> = ({
  title = 'Container Updates',
  cardStyle,
}) => {
  const [updates, setUpdates] = useState<ContainerUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<ContainerUpdate | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);

  // Mock container updates data
  const mockUpdates: ContainerUpdate[] = [
    {
      id: 'nginx-1',
      containerName: 'nginx_web',
      serviceName: 'Nginx Web Server',
      currentVersion: '1.24.0',
      latestVersion: '1.25.3',
      updateType: 'security',
      releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      size: '45.2 MB',
      changelog: 'Security fixes for CVE-2023-44487, performance improvements, bug fixes in SSL module',
      securityFixes: ['CVE-2023-44487', 'CVE-2023-44488'],
      status: 'available',
      lastChecked: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: 'postgres-1',
      containerName: 'postgres_db',
      serviceName: 'PostgreSQL Database',
      currentVersion: '15.4',
      latestVersion: '16.1',
      updateType: 'major',
      releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      size: '156.8 MB',
      changelog: 'Major version upgrade with new features, performance improvements, and breaking changes',
      status: 'available',
      lastChecked: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: 'redis-1',
      containerName: 'redis_cache',
      serviceName: 'Redis Cache',
      currentVersion: '7.0.12',
      latestVersion: '7.2.3',
      updateType: 'minor',
      releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      size: '31.5 MB',
      changelog: 'Performance improvements, new data structures, bug fixes',
      status: 'updating',
      progress: 45,
      lastChecked: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: 'node-1',
      containerName: 'app_backend',
      serviceName: 'Node.js Backend',
      currentVersion: '18.17.1',
      latestVersion: '18.18.2',
      updateType: 'patch',
      releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      size: '23.1 MB',
      changelog: 'Bug fixes and stability improvements',
      status: 'updated',
      lastChecked: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
      id: 'grafana-1',
      containerName: 'grafana_monitoring',
      serviceName: 'Grafana',
      currentVersion: '10.1.5',
      latestVersion: '10.2.2',
      updateType: 'minor',
      releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      size: '67.3 MB',
      changelog: 'New dashboard features, improved alerting, UI enhancements',
      status: 'available',
      lastChecked: new Date(Date.now() - 1000 * 60 * 45),
    },
  ];

  useEffect(() => {
    setUpdates(mockUpdates);
    
    // Load auto-update setting
    const autoUpdate = localStorage.getItem('ssm-auto-update');
    setAutoUpdateEnabled(autoUpdate === 'true');
    
    // Simulate periodic update checks
    const interval = setInterval(() => {
      checkForUpdates();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update last checked time
    const updatedUpdates = updates.map(update => ({
      ...update,
      lastChecked: new Date(),
    }));
    
    setUpdates(updatedUpdates);
    setLoading(false);
  };

  const updateContainer = async (update: ContainerUpdate) => {
    // Start update process
    const updatedList = updates.map(u => 
      u.id === update.id 
        ? { ...u, status: 'updating' as const, progress: 0 }
        : u
    );
    setUpdates(updatedList);

    // Simulate update progress
    const progressInterval = setInterval(() => {
      setUpdates(current => current.map(u => {
        if (u.id === update.id && u.status === 'updating') {
          const newProgress = (u.progress || 0) + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            // 95% success rate
            const success = Math.random() > 0.05;
            message[success ? 'success' : 'error'](
              `${update.serviceName} ${success ? 'updated successfully' : 'update failed'}`
            );
            return {
              ...u,
              status: success ? 'updated' : 'failed',
              progress: 100,
              currentVersion: success ? update.latestVersion : u.currentVersion,
            };
          }
          return { ...u, progress: newProgress };
        }
        return u;
      }));
    }, 1000);

    message.info(`Starting update for ${update.serviceName}`);
  };

  const rollbackContainer = async (update: ContainerUpdate) => {
    const updatedList = updates.map(u => 
      u.id === update.id 
        ? { ...u, status: 'rollback' as const }
        : u
    );
    setUpdates(updatedList);

    // Simulate rollback
    setTimeout(() => {
      setUpdates(current => current.map(u => 
        u.id === update.id 
          ? { ...u, status: 'available', currentVersion: '1.24.0' } // Previous version
          : u
      ));
      message.success(`${update.serviceName} rolled back successfully`);
    }, 3000);

    message.info(`Rolling back ${update.serviceName}`);
  };

  const getUpdateTypeColor = (type: ContainerUpdate['updateType']) => {
    switch (type) {
      case 'security': return '#ff4d4f';
      case 'major': return '#722ed1';
      case 'minor': return '#1890ff';
      case 'patch': return '#52c41a';
      default: return '#8c8c8c';
    }
  };

  const getStatusIcon = (status: ContainerUpdate['status']) => {
    switch (status) {
      case 'available': return <UpOutlined style={{ color: '#1890ff' }} />;
      case 'updating': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'updated': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed': return <ExclamationTriangleOutlined style={{ color: '#ff4d4f' }} />;
      case 'rollback': return <RollbackOutlined style={{ color: '#722ed1' }} />;
      default: return <InfoCircleOutlined />;
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const availableUpdates = updates.filter(u => u.status === 'available');
  const updatingCount = updates.filter(u => u.status === 'updating' || u.status === 'rollback').length;
  const securityUpdates = updates.filter(u => u.updateType === 'security' && u.status === 'available');

  return (
    <>
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          color: 'white',
          border: 'none',
          height: '400px',
          ...cardStyle,
        }}
        bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Space direction="horizontal" style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
          <Typography.Title
            level={4}
            style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            📦 {title}
          </Typography.Title>
          <Space>
            {securityUpdates.length > 0 && (
              <Badge count={securityUpdates.length} style={{ backgroundColor: '#ff4d4f' }}>
                <SecurityScanOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
              </Badge>
            )}
            <Button
              type="text"
              icon={<ReloadOutlined />}
              size="small"
              onClick={checkForUpdates}
              loading={loading}
              style={{ color: '#8c8c8c' }}
            />
          </Space>
        </Space>

        {/* Summary */}
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <Space split={<span style={{ color: '#3a3a3a' }}>|</span>}>
            <span style={{ color: '#d9d9d9', fontSize: '12px' }}>
              <Badge count={availableUpdates.length} style={{ backgroundColor: '#1890ff', marginRight: '4px' }} />
              Available
            </span>
            <span style={{ color: '#d9d9d9', fontSize: '12px' }}>
              <Badge count={updatingCount} style={{ backgroundColor: '#faad14', marginRight: '4px' }} />
              In Progress
            </span>
            <span style={{ color: '#d9d9d9', fontSize: '12px' }}>
              <Badge count={securityUpdates.length} style={{ backgroundColor: '#ff4d4f', marginRight: '4px' }} />
              Security
            </span>
          </Space>
        </div>

        {/* Updates List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <List
            dataSource={updates.slice(0, 6)}
            renderItem={(update) => (
              <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #3a3a3a' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <Space align="center">
                        {getStatusIcon(update.status)}
                        <Typography.Text strong style={{ color: '#ffffff', fontSize: '13px' }}>
                          {update.serviceName}
                        </Typography.Text>
                        <Tag
                          color={getUpdateTypeColor(update.updateType)}
                          style={{ fontSize: '10px', margin: 0 }}
                        >
                          {update.updateType}
                        </Tag>
                      </Space>
                      
                      <div style={{ marginTop: '2px' }}>
                        <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px' }}>
                          {update.currentVersion} → {update.latestVersion}
                        </Typography.Text>
                        {update.securityFixes && update.securityFixes.length > 0 && (
                          <span style={{ marginLeft: '8px' }}>
                            <SecurityScanOutlined style={{ color: '#ff4d4f', fontSize: '10px' }} />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Space size="small">
                      {update.status === 'available' && (
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          size="small"
                          onClick={() => updateContainer(update)}
                          style={{
                            backgroundColor: update.updateType === 'security' ? '#ff4d4f' : '#4ecb71',
                            borderColor: update.updateType === 'security' ? '#ff4d4f' : '#4ecb71',
                          }}
                        >
                          Update
                        </Button>
                      )}
                      
                      {update.status === 'updated' && (
                        <Tooltip title="Rollback to previous version">
                          <Button
                            type="text"
                            icon={<RollbackOutlined />}
                            size="small"
                            onClick={() => rollbackContainer(update)}
                            style={{ color: '#722ed1' }}
                          />
                        </Tooltip>
                      )}
                      
                      <Button
                        type="text"
                        icon={<InfoCircleOutlined />}
                        size="small"
                        onClick={() => setShowDetails(update)}
                        style={{ color: '#8c8c8c' }}
                      />
                    </Space>
                  </div>
                  
                  {update.status === 'updating' && update.progress !== undefined && (
                    <Progress
                      percent={Math.round(update.progress)}
                      size="small"
                      strokeColor="#1890ff"
                      trailColor="rgba(255, 255, 255, 0.1)"
                      style={{ marginTop: '4px' }}
                    />
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <Typography.Text style={{ color: '#666', fontSize: '10px' }}>
                      Size: {update.size}
                    </Typography.Text>
                    <Typography.Text style={{ color: '#666', fontSize: '10px' }}>
                      Checked: {formatRelativeTime(update.lastChecked)}
                    </Typography.Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
          Last checked: {updates.length > 0 ? formatRelativeTime(updates[0].lastChecked) : 'Never'}
        </div>
      </Card>

      {/* Update Details Modal */}
      <Modal
        title={`Update Details: ${showDetails?.serviceName}`}
        open={!!showDetails}
        onCancel={() => setShowDetails(null)}
        footer={null}
        width={600}
      >
        {showDetails && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Typography.Text strong>Container: </Typography.Text>
              <Typography.Text>{showDetails.containerName}</Typography.Text>
            </div>
            
            <div>
              <Typography.Text strong>Version Update: </Typography.Text>
              <Typography.Text>
                {showDetails.currentVersion} → {showDetails.latestVersion}
              </Typography.Text>
              <Tag
                color={getUpdateTypeColor(showDetails.updateType)}
                style={{ marginLeft: '8px' }}
              >
                {showDetails.updateType}
              </Tag>
            </div>
            
            <div>
              <Typography.Text strong>Release Date: </Typography.Text>
              <Typography.Text>{showDetails.releaseDate.toLocaleDateString()}</Typography.Text>
            </div>
            
            <div>
              <Typography.Text strong>Download Size: </Typography.Text>
              <Typography.Text>{showDetails.size}</Typography.Text>
            </div>
            
            {showDetails.securityFixes && showDetails.securityFixes.length > 0 && (
              <div>
                <Typography.Text strong style={{ color: '#ff4d4f' }}>Security Fixes: </Typography.Text>
                <div style={{ marginTop: '4px' }}>
                  {showDetails.securityFixes.map(fix => (
                    <Tag key={fix} color="red" style={{ marginBottom: '4px' }}>
                      {fix}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            
            {showDetails.changelog && (
              <div>
                <Typography.Text strong>Changelog: </Typography.Text>
                <Typography.Paragraph style={{ color: '#8c8c8c', marginTop: '4px' }}>
                  {showDetails.changelog}
                </Typography.Paragraph>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {showDetails.status === 'available' && (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    updateContainer(showDetails);
                    setShowDetails(null);
                  }}
                  style={{
                    backgroundColor: showDetails.updateType === 'security' ? '#ff4d4f' : '#4ecb71',
                    borderColor: showDetails.updateType === 'security' ? '#ff4d4f' : '#4ecb71',
                  }}
                >
                  Update Now
                </Button>
              )}
              
              {showDetails.status === 'updated' && (
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => {
                    rollbackContainer(showDetails);
                    setShowDetails(null);
                  }}
                  style={{ color: '#722ed1', borderColor: '#722ed1' }}
                >
                  Rollback
                </Button>
              )}
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default ContainerUpdateCenter;
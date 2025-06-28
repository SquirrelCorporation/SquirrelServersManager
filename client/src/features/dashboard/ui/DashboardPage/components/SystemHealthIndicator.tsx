import React from 'react';
import { Card, Progress, Alert, Space, Typography, Statistic, Row, Col } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationTriangleOutlined, 
  InfoCircleOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  MinusOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SystemHealthIndicatorProps {
  score: number;
  criticalAlerts: number;
  trends?: {
    cpu: { current: number; trend: number; direction: 'up' | 'down' | 'stable' };
    memory: { current: number; trend: number; direction: 'up' | 'down' | 'stable' };
    disk: { current: number; trend: number; direction: 'up' | 'down' | 'stable' };
  } | null;
}

export const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({
  score,
  criticalAlerts,
  trends
}) => {
  const getHealthStatus = (score: number) => {
    if (score >= 95) return { 
      level: 'excellent', 
      color: '#52c41a', 
      text: 'Excellent',
      description: 'All systems operating optimally'
    };
    if (score >= 80) return { 
      level: 'good', 
      color: '#1890ff', 
      text: 'Good',
      description: 'Systems operating well with minor issues'
    };
    if (score >= 60) return { 
      level: 'warning', 
      color: '#faad14', 
      text: 'Warning',
      description: 'Some systems need attention'
    };
    return { 
      level: 'critical', 
      color: '#ff4d4f', 
      text: 'Critical',
      description: 'Immediate attention required'
    };
  };

  const getAlertType = (criticalAlerts: number) => {
    if (criticalAlerts === 0) return null;
    if (criticalAlerts <= 2) return 'warning';
    return 'error';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUpOutlined />;
      case 'down': return <TrendingDownOutlined />;
      default: return <MinusOutlined />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable', current: number) => {
    if (direction === 'stable') return '#666';
    // For performance metrics, "up" is generally bad, "down" is good
    if (current > 80) return direction === 'up' ? '#ff4d4f' : '#52c41a';
    if (current > 60) return direction === 'up' ? '#faad14' : '#1890ff';
    return '#666';
  };

  const status = getHealthStatus(score);
  const alertType = getAlertType(criticalAlerts);

  return (
    <Card>
      <Row gutter={[24, 16]} align="middle">
        {/* Health Score */}
        <Col xs={24} sm={12} md={8}>
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ margin: '0 0 16px 0' }}>
              System Health
            </Title>
            <Progress
              type="circle"
              percent={score}
              size={120}
              strokeColor={status.color}
              format={(percent) => (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: status.color }}>
                    {percent}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {status.text}
                  </div>
                </div>
              )}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              {status.description}
            </div>
          </div>
        </Col>

        {/* Performance Trends */}
        {trends && (
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ margin: '0 0 16px 0' }}>
              Performance Trends
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>CPU Usage</Text>
                <Space>
                  <span style={{ color: getTrendColor(trends.cpu.direction, trends.cpu.current) }}>
                    {getTrendIcon(trends.cpu.direction)}
                  </span>
                  <Text strong style={{ color: getTrendColor(trends.cpu.direction, trends.cpu.current) }}>
                    {trends.cpu.current.toFixed(1)}%
                  </Text>
                </Space>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Memory Usage</Text>
                <Space>
                  <span style={{ color: getTrendColor(trends.memory.direction, trends.memory.current) }}>
                    {getTrendIcon(trends.memory.direction)}
                  </span>
                  <Text strong style={{ color: getTrendColor(trends.memory.direction, trends.memory.current) }}>
                    {trends.memory.current.toFixed(1)}%
                  </Text>
                </Space>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Disk Usage</Text>
                <Space>
                  <span style={{ color: getTrendColor(trends.disk.direction, trends.disk.current) }}>
                    {getTrendIcon(trends.disk.direction)}
                  </span>
                  <Text strong style={{ color: getTrendColor(trends.disk.direction, trends.disk.current) }}>
                    {trends.disk.current.toFixed(1)}%
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>
        )}

        {/* Alerts and Status */}
        <Col xs={24} sm={24} md={8}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>
              System Status
            </Title>
            
            {criticalAlerts > 0 ? (
              <Alert
                message={`${criticalAlerts} Critical Alert${criticalAlerts > 1 ? 's' : ''}`}
                description="Immediate attention required for system stability"
                type={alertType as any}
                icon={<ExclamationTriangleOutlined />}
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                message="No Critical Alerts"
                description="All systems are operating within normal parameters"
                type="success"
                icon={<CheckCircleOutlined />}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f6f6f6', 
              borderRadius: '6px',
              border: `2px solid ${status.color}` 
            }}>
              <Space>
                <InfoCircleOutlined style={{ color: status.color }} />
                <div>
                  <Text strong style={{ color: status.color }}>
                    Overall Status: {status.text}
                  </Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </Space>
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
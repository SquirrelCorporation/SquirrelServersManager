import React from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { 
  DesktopOutlined, 
  CloudOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined 
} from '@ant-design/icons';
import { RingProgress } from '@shared/ui/patterns';
import { DashboardStats } from '../../../api/dashboard';

interface StatsCardsProps {
  stats?: DashboardStats;
  compact?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, compact = false }) => {
  if (!stats) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map(i => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card loading style={{ height: compact ? 120 : 160 }} />
          </Col>
        ))}
      </Row>
    );
  }

  const deviceOnlinePercentage = stats.devices.total > 0 
    ? (stats.devices.online / stats.devices.total) * 100 
    : 0;

  const containerRunningPercentage = stats.containers.total > 0 
    ? (stats.containers.running / stats.containers.total) * 100 
    : 0;

  const cardHeight = compact ? 120 : 160;

  return (
    <Row gutter={[16, 16]}>
      {/* Devices */}
      <Col xs={24} sm={12} lg={6}>
        <Card 
          size={compact ? 'small' : 'default'}
          style={{ height: cardHeight }}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <Statistic
                title="Devices"
                value={stats.devices.total}
                prefix={<DesktopOutlined />}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    <div style={{ color: '#52c41a' }}>
                      <CheckCircleOutlined /> {stats.devices.online} Online
                    </div>
                    {stats.devices.offline > 0 && (
                      <div style={{ color: '#ff4d4f' }}>
                        <CloseCircleOutlined /> {stats.devices.offline} Offline
                      </div>
                    )}
                  </div>
                }
              />
            </div>
            {!compact && (
              <div style={{ marginLeft: 16 }}>
                <RingProgress
                  value={deviceOnlinePercentage}
                  size="small"
                  format={(val) => `${Math.round(val)}%`}
                  color={{ start: '#52c41a', end: '#73d13d' }}
                  label="Online"
                />
              </div>
            )}
          </div>
        </Card>
      </Col>

      {/* Containers */}
      <Col xs={24} sm={12} lg={6}>
        <Card 
          size={compact ? 'small' : 'default'}
          style={{ height: cardHeight }}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <Statistic
                title="Containers"
                value={stats.containers.total}
                prefix={<CloudOutlined />}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    <div style={{ color: '#52c41a' }}>
                      <PlayCircleOutlined /> {stats.containers.running} Running
                    </div>
                    {stats.containers.stopped > 0 && (
                      <div style={{ color: '#faad14' }}>
                        <ExclamationCircleOutlined /> {stats.containers.stopped} Stopped
                      </div>
                    )}
                  </div>
                }
              />
            </div>
            {!compact && (
              <div style={{ marginLeft: 16 }}>
                <RingProgress
                  value={containerRunningPercentage}
                  size="small"
                  format={(val) => `${Math.round(val)}%`}
                  color={{ start: '#1890ff', end: '#69c0ff' }}
                  label="Running"
                />
              </div>
            )}
          </div>
        </Card>
      </Col>

      {/* Performance Metrics */}
      <Col xs={24} sm={12} lg={6}>
        <Card 
          size={compact ? 'small' : 'default'}
          style={{ height: cardHeight }}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <Statistic
                title="Avg Performance"
                value={Math.round(
                  (stats.performance.avgCpuUsage + 
                   stats.performance.avgMemoryUsage + 
                   stats.performance.avgDiskUsage) / 3
                )}
                suffix={
                  <div>
                    <span style={{ fontSize: '14px' }}>%</span>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: 4 }}>
                      <div>CPU: {Math.round(stats.performance.avgCpuUsage)}%</div>
                      <div>RAM: {Math.round(stats.performance.avgMemoryUsage)}%</div>
                      <div>Disk: {Math.round(stats.performance.avgDiskUsage)}%</div>
                    </div>
                  </div>
                }
              />
            </div>
            {!compact && (
              <div style={{ marginLeft: 16 }}>
                <RingProgress
                  value={stats.performance.avgCpuUsage}
                  size="small"
                  format={(val) => `${Math.round(val)}%`}
                  color={
                    stats.performance.avgCpuUsage > 80 
                      ? '#ff4d4f' 
                      : stats.performance.avgCpuUsage > 60 
                      ? '#faad14' 
                      : '#52c41a'
                  }
                  label="CPU"
                />
              </div>
            )}
          </div>
        </Card>
      </Col>

      {/* Recent Activity */}
      <Col xs={24} sm={12} lg={6}>
        <Card 
          size={compact ? 'small' : 'default'}
          style={{ height: cardHeight }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Statistic
              title="Recent Activity"
              value={stats.recent.playbookExecutions}
              suffix="playbooks"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 'auto' }}>
              <div>{stats.recent.systemAlerts} system alerts</div>
              <div>
                Last update: {new Date(stats.recent.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};
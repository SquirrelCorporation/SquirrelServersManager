import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Row, Col, Select, Button, Spin, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useSlot } from '@/plugins/contexts/plugin-context';
import { useDashboardData } from '../../model/useDashboard';
import { useUIStore } from '@app/store';
import { StatsCards } from './components/StatsCards';
import { PerformanceChart } from './components/PerformanceChart';
import { AvailabilityTable } from './components/AvailabilityTable';
import { SystemHealthIndicator } from './components/SystemHealthIndicator';

export const DashboardPage: React.FC = () => {
  const [performanceTimeRange, setPerformanceTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  // Get the dashboard widgets slot renderer for plugins
  const DashboardWidgetsSlot = useSlot('dashboard-widgets');
  
  // Global UI state
  const { compactMode } = useUIStore();
  
  // Dashboard data with all queries
  const {
    stats,
    performance,
    availability,
    systemHealthScore,
    performanceTrends,
    criticalAlertsCount,
    isLoading,
    hasError,
    refetchAll,
  } = useDashboardData(performanceTimeRange);

  const handleTimeRangeChange = (value: '1h' | '24h' | '7d' | '30d') => {
    setPerformanceTimeRange(value);
  };

  const handleRefresh = () => {
    refetchAll();
  };

  if (hasError) {
    return (
      <PageContainer>
        <Alert
          message="Failed to load dashboard data"
          description="There was an error loading the dashboard. Please try refreshing the page."
          type="error"
          action={
            <Button size="small" danger onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{ 
        title: undefined,
        extra: [
          <Select
            key="timeRange"
            value={performanceTimeRange}
            onChange={handleTimeRangeChange}
            style={{ width: 120 }}
            options={[
              { label: 'Last Hour', value: '1h' },
              { label: 'Last 24h', value: '24h' },
              { label: 'Last 7 days', value: '7d' },
              { label: 'Last 30 days', value: '30d' },
            ]}
          />,
          <Button 
            key="refresh"
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
        ]
      }}
    >
      <Spin spinning={isLoading} tip="Loading dashboard data...">
        <div style={{ minHeight: '400px' }}>
          {/* System Health Indicator */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <SystemHealthIndicator 
                score={systemHealthScore}
                criticalAlerts={criticalAlertsCount}
                trends={performanceTrends}
              />
            </Col>
          </Row>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <StatsCards 
                stats={stats}
                compact={compactMode}
              />
            </Col>
          </Row>

          {/* Performance Chart */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <PerformanceChart 
                data={performance || []}
                timeRange={performanceTimeRange}
                trends={performanceTrends}
              />
            </Col>
          </Row>

          {/* Availability Table */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <AvailabilityTable 
                data={availability || []}
                compact={compactMode}
              />
            </Col>
          </Row>

          {/* Plugin Widgets */}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div style={{ marginTop: '24px' }}>
                <DashboardWidgetsSlot />
              </div>
            </Col>
          </Row>
        </div>
      </Spin>
    </PageContainer>
  );
};
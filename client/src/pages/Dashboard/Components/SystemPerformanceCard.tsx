import { getDashboardSystemPerformance } from '@/services/rest/statistics/stastistics';
import { InfoCircleFilled, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Tooltip, Typography, Card, Skeleton } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API } from 'ssm-shared-lib';

const SystemPerformanceCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [performancesStat, setPerformancesStat] = useState<API.PerformanceStat>(
    {
      currentCpu: 0,
      currentMem: 0,
      previousCpu: 0,
      previousMem: 0,
      danger: false,
      message: '',
    },
  );

  const asyncFetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDashboardSystemPerformance();
      setPerformancesStat(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void asyncFetch();
  }, [asyncFetch]);

  const cpuTrendFlag = useMemo(
    () =>
      performancesStat?.previousCpu - performancesStat?.currentCpu > 0
        ? 'up'
        : 'down',
    [performancesStat],
  );

  const memTrendFlag = useMemo(
    () =>
      performancesStat?.previousMem - performancesStat?.currentMem > 0
        ? 'up'
        : 'down',
    [performancesStat],
  );

  if (loading) {
    return (
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          border: 'none',
          minHeight: '180px',
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        minHeight: '180px',
      }}
      bodyStyle={{ padding: '20px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography.Title level={5} style={{ color: '#ffffff', margin: 0, fontSize: '16px', fontWeight: 600 }}>
          System Performance
        </Typography.Title>
        <Tooltip title="System performance settings can be defined in settings">
          <InfoCircleFilled style={{ color: '#8c8c8c', fontSize: '14px' }} />
        </Tooltip>
      </div>

      {/* Performance Status */}
      <div style={{ marginBottom: '12px' }}>
        <Typography.Text style={{ color: performancesStat?.danger ? '#ff4d4f' : '#52c41a', fontSize: '20px', fontWeight: 600 }}>
          {performancesStat?.message}
        </Typography.Text>
      </div>

      {/* Current Stats */}
      <div style={{ marginBottom: '12px' }}>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
          Current: 
        </Typography.Text>
        <Typography.Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500, marginLeft: '6px' }}>
          {(performancesStat?.currentCpu || 0).toFixed(1)}% / {(performancesStat?.currentMem || 0).toFixed(1)}%
        </Typography.Text>
      </div>

      {/* Trend Information - Compact */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
            CPU
          </Typography.Text>
          {cpuTrendFlag === 'up' ? (
            <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
          )}
          <Typography.Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
            {Math.abs(performancesStat?.previousCpu - performancesStat?.currentCpu).toFixed(1)}%
          </Typography.Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
            MEM
          </Typography.Text>
          {memTrendFlag === 'up' ? (
            <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
          )}
          <Typography.Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
            {Math.abs(performancesStat?.previousMem - performancesStat?.currentMem).toFixed(1)}%
          </Typography.Text>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(SystemPerformanceCard);
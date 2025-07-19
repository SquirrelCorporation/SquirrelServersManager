import { getDashboardAvailabilityStat } from '@/services/rest/statistics/stastistics';
import { InfoCircleFilled, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { Tooltip, Typography, Card, Skeleton, Progress } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API } from 'ssm-shared-lib';

const AvailabilityCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [availabilityStat, setAvailabilityStat] = useState<
    API.AvailabilityStat | undefined
  >(undefined);

  const asyncFetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDashboardAvailabilityStat();
      setAvailabilityStat(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    asyncFetch();
  }, [asyncFetch]);

  const percent = useMemo(
    () =>
      availabilityStat ? (availabilityStat.availability * 100).toFixed(0) : 0,
    [availabilityStat],
  );

  const trendFlag = useMemo(() => {
    if (!availabilityStat?.availability || !availabilityStat?.lastMonth) {
      return undefined;
    }
    if (availabilityStat.availability > availabilityStat.lastMonth) return 'up';
    if (availabilityStat.availability < availabilityStat.lastMonth) return 'down';
    return 'eq';
  }, [availabilityStat]);

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
          System Availability
        </Typography.Title>
        <Tooltip title="The percentage of uptime of your combined devices">
          <InfoCircleFilled style={{ color: '#8c8c8c', fontSize: '14px' }} />
        </Tooltip>
      </div>

      {/* Availability Percentage */}
      <div style={{ marginBottom: '12px' }}>
        <Typography.Text style={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}>
          {availabilityStat ? (availabilityStat.availability < 1 ? (availabilityStat.availability * 100).toFixed(3) : 100) : '0'}%
        </Typography.Text>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <Progress 
          percent={Number(percent)} 
          strokeColor="#52c41a"
          trailColor="#303030"
          showInfo={false}
          strokeWidth={6}
          style={{ marginBottom: '0' }}
        />
      </div>

      {/* Last Month Trend - Compact */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
          Last Month:
        </Typography.Text>
        <Typography.Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
          {availabilityStat
            ? availabilityStat.lastMonth < 1
              ? (availabilityStat.lastMonth * 100).toFixed(3)
              : 100
            : '0'}%
        </Typography.Text>
        {trendFlag && (
          <>
            {trendFlag === 'up' && <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />}
            {trendFlag === 'down' && <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />}
            {trendFlag === 'eq' && <MinusOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />}
          </>
        )}
      </div>
    </Card>
  );
};

export default React.memo(AvailabilityCard);
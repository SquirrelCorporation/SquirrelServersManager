import { getDashboardAvailabilityStat } from '@/services/rest/statistics/stastistics';
import { InfoCircleFilled, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { Tooltip, Typography, Card, Skeleton, Progress } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API } from 'ssm-shared-lib';
import { getSemanticColors } from './utils/colorPalettes';

interface AvailabilityCardProps {
  colorPalette?: string;
  customColors?: string[];
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({
  colorPalette = 'default',
  customColors = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [availabilityStat, setAvailabilityStat] = useState<
    API.AvailabilityStat | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getDashboardAvailabilityStat();
        setAvailabilityStat(response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Runs once on mount

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

  // Get semantic colors from palette
  const semanticColors = useMemo(() => {
    return getSemanticColors(colorPalette);
  }, [colorPalette]);

  if (loading) {
    return (
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          border: 'none',
          height: '180px',
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
        height: '180px',
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
        <Typography.Text style={{ color: semanticColors.positive, fontSize: '28px', fontWeight: 600 }}>
          {availabilityStat ? (availabilityStat.availability < 1 ? (availabilityStat.availability * 100).toFixed(3) : 100) : '0'}%
        </Typography.Text>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <Progress 
          percent={Number(percent)} 
          strokeColor={semanticColors.positive}
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
            {trendFlag === 'up' && <ArrowUpOutlined style={{ color: semanticColors.positive, fontSize: '12px' }} />}
            {trendFlag === 'down' && <ArrowDownOutlined style={{ color: semanticColors.negative, fontSize: '12px' }} />}
            {trendFlag === 'eq' && <MinusOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />}
          </>
        )}
      </div>
    </Card>
  );
};

export default React.memo(AvailabilityCard);
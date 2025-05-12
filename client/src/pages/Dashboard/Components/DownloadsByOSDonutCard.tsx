import React from 'react';
import { Card, Typography, Space } from 'antd';
import { Pie, PieConfig, Datum } from '@ant-design/plots'; // Reusing Pie for Donut

interface OSDownloadData {
  type: string; // OS Name
  value: number; // Count or percentage
  color: string;
}

interface DownloadsByOSDonutCardProps {
  title: string;
  subtitle: string;
  totalDownloadsLabel: string; // e.g. "Total"
  totalDownloadsValue: string;
  chartData: OSDownloadData[];
  cardStyle?: React.CSSProperties;
}

const DownloadsByOSDonutCard: React.FC<DownloadsByOSDonutCardProps> = ({
  title,
  subtitle,
  totalDownloadsLabel,
  totalDownloadsValue,
  chartData,
  cardStyle,
}) => {
  const pieConfig: PieConfig = {
    appendPadding: 10,
    data: chartData,
    angleField: 'value',
    colorField: 'type',
    color: chartData.map((item) => item.color),
    radius: 0.9,
    innerRadius: 0.75,
    height: 230, // Adjusted height
    legend: false,
    label: false,
    statistic: {
      title: {
        offsetY: -12, // Adjusted offset for spacing
        content: totalDownloadsLabel,
        style: {
          color: '#8c8c8c', // Lighter gray for "Total"
          fontSize: '14px', // Adjusted font size
          lineHeight: '20px',
          fontWeight: 400,
        },
      },
      content: {
        offsetY: 8, // Adjusted offset
        content: totalDownloadsValue,
        style: {
          color: '#f0f0f0', // Bright white for the value
          fontSize: '28px', // Adjusted font size for value
          fontWeight: '600',
          lineHeight: '36px',
        },
      },
    },
    pieStyle: {
      lineWidth: 0,
    },
    tooltip: {
      formatter: (datum: Datum) => ({
        name: datum.type,
        value: `${datum.value}`,
      }),
      domStyles: {
        'g2-tooltip': {
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
          borderRadius: '4px',
          padding: '8px 12px',
        },
      },
    },
  };

  return (
    <Card
      style={{
        backgroundColor: '#222225', // Matched background
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Consistent shadow
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <Space direction="vertical" size={2} style={{ marginBottom: '16px' }}>
        {' '}
        {/* Adjusted spacing */}
        <Typography.Title
          level={4}
          style={{ color: '#f0f0f0', margin: 0, fontWeight: 500 }}
        >
          {title}
        </Typography.Title>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: 13 }}>
          {subtitle}
        </Typography.Text>
      </Space>
      <Pie {...pieConfig} />
      {/* Legend can be added here if needed, similar to ToursAvailableDonutCard */}
    </Card>
  );
};

export default DownloadsByOSDonutCard;

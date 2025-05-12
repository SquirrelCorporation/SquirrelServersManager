import React from 'react';
import { Card, Typography, Statistic, Space } from 'antd';
import { Area, AreaConfig, Datum } from '@ant-design/plots';
import { ArrowUpOutlined } from '@ant-design/icons';

interface TotalIncomesCardProps {
  title: string;
  amount: string;
  trendPercentage: number;
  trendDescription: string;
  chartData: Array<{ date: string; value: number }>;
  cardStyle?: React.CSSProperties;
}

const TotalIncomesCard: React.FC<TotalIncomesCardProps> = ({
  title,
  amount,
  trendPercentage,
  trendDescription,
  chartData,
  cardStyle,
}) => {
  const areaConfig: AreaConfig = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    height: 150, // Approximate height
    smooth: true,
    xAxis: {
      label: null,
      line: null,
      tickLine: null,
      grid: null,
    },
    yAxis: {
      label: null,
      line: null,
      tickLine: null,
      grid: null,
    },
    areaStyle: () => ({
      fill: 'l(270) 0:#2D2D2D 1:#3f8600', // Gradient from card bg to green
    }),
    line: { style: { stroke: '#52c41a', lineWidth: 2 } },
    tooltip: {
      formatter: (datum: Datum) => ({
        name: 'Income',
        value: `$${datum.value}`,
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
    padding: 0, // Remove padding to make chart fill space
  };

  return (
    <Card
      style={{
        backgroundColor: '#2D2D2D',
        borderRadius: '16px',
        color: 'white',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space
          align="baseline"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
            {title}
          </Typography.Title>
          <Statistic
            value={trendPercentage}
            precision={1}
            valueStyle={{ color: '#3f8600', fontSize: '14px' }}
            prefix={<ArrowUpOutlined />}
            suffix={
              <span style={{ color: '#A0A0A0', marginLeft: '4px' }}>
                % {trendDescription}
              </span>
            }
          />
        </Space>
        <Typography.Title
          level={1}
          style={{
            color: 'white',
            margin: 0,
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          {amount}
        </Typography.Title>
        <div style={{ marginTop: '10px' }}>
          <Area {...areaConfig} />
        </div>
      </Space>
    </Card>
  );
};

export default TotalIncomesCard;

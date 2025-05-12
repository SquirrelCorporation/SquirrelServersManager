import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import { Pie, PieConfig, Datum } from '@ant-design/plots';

interface LegendItem {
  name: string;
  value: string;
  color: string;
}
interface ToursAvailableDonutCardProps {
  title: string;
  totalTours: number;
  mainLabel: string; // e.g., "Tours"
  chartData: Array<{ type: string; value: number; color: string }>;
  legendItems: LegendItem[];
  cardStyle?: React.CSSProperties;
}

const ToursAvailableDonutCard: React.FC<ToursAvailableDonutCardProps> = ({
  title,
  totalTours,
  mainLabel,
  chartData,
  legendItems,
  cardStyle,
}) => {
  const pieConfig: PieConfig = {
    appendPadding: 10,
    data: chartData,
    angleField: 'value',
    colorField: 'type',
    color: chartData.map((item) => item.color),
    radius: 0.9,
    innerRadius: 0.7,
    height: 220,
    legend: false,
    label: false,
    statistic: {
      title: {
        offsetY: -10,
        content: totalTours.toString(),
        style: {
          color: '#f0f0f0',
          fontSize: '30px',
          fontWeight: '600',
          lineHeight: '38px',
        },
      },
      content: {
        offsetY: 10,
        content: mainLabel,
        style: {
          color: '#8c8c8c',
          fontSize: '13px',
          lineHeight: '18px',
        },
      },
    },
    pieStyle: {
      lineWidth: 0,
    },
    tooltip: {
      formatter: (datum: Datum) => ({
        name: datum.type,
        value: `${datum.value} tours`,
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
      title={
        <Typography.Title
          level={4}
          style={{ color: '#f0f0f0', margin: 0, fontWeight: 500 }}
        >
          {title}
        </Typography.Title>
      }
      style={{
        backgroundColor: '#222225',
        borderRadius: '16px',
        color: 'white',
        ...cardStyle,
      }}
      headStyle={{
        borderBottom: 0,
        paddingTop: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '8px',
      }}
      bodyStyle={{ padding: '16px 24px 24px 24px' }}
    >
      <Pie {...pieConfig} />
      <Space
        direction="vertical"
        size={8}
        style={{ marginTop: '24px', width: '100%' }}
      >
        {legendItems.map((item) => (
          <Row
            key={item.name}
            justify="space-between"
            style={{ width: '100%' }}
            align="middle"
          >
            <Col>
              <Space align="center" size={8}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: item.color,
                    borderRadius: '3px',
                  }}
                />
                <Typography.Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
                  {item.name}
                </Typography.Text>
              </Space>
            </Col>
            <Col>
              <Typography.Text
                style={{
                  color: '#f0f0f0',
                  fontWeight: '500',
                  fontSize: '13px',
                }}
              >
                {item.value}
              </Typography.Text>
            </Col>
          </Row>
        ))}
      </Space>
    </Card>
  );
};
export default ToursAvailableDonutCard;

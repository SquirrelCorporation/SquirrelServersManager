import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import { Pie, PieConfig, Datum } from '@ant-design/plots';

interface VisitData {
  type: string; // Region name
  value: number; // Percentage or count
  color: string;
}

interface VisitsPieChartCardProps {
  title: string;
  chartData: VisitData[];
  cardStyle?: React.CSSProperties;
}

const VisitsPieChartCard: React.FC<VisitsPieChartCardProps> = ({
  title,
  chartData,
  cardStyle,
}) => {
  const pieConfig: PieConfig = {
    appendPadding: 10,
    data: chartData,
    angleField: 'value',
    colorField: 'type',
    color: chartData.map((item) => item.color),
    radius: 0.85, // Adjusted radius slightly
    height: 230, // Adjusted height
    legend: false, // Custom legend
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{percentage}',
      style: {
        fill: '#d9d9d9', // Lighter fill for label text
        fontSize: 12,
        textAlign: 'center', // Ensure percentage is centered if it wraps
      },
      // Style for the leader line (spider line)
      line: {
        style: {
          stroke: 'rgba(255, 255, 255, 0.3)', // Faint white/gray line
          lineWidth: 0.5,
        },
      },
    },
    pieStyle: {
      lineWidth: 0, // No border between slices
    },
    tooltip: {
      formatter: (datum: Datum) => ({
        name: datum.type,
        value: `${datum.value}%`,
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
        backgroundColor: '#222225', // Matched background
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
      <Row
        gutter={[16, 10]} // Adjusted gutter for legend items
        style={{ marginTop: '20px', justifyContent: 'center' }}
      >
        {chartData.map((item) => (
          <Col key={item.type}>
            <Space align="center" size={6}>
              <div // Circular marker
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                }}
              />
              <Typography.Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
                {' '}
                {/* Adjusted legend text */}
                {item.type}
              </Typography.Text>
            </Space>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default VisitsPieChartCard;

import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import DebugOverlay from './DebugOverlay';

interface VisitData {
  type: string; // Region name
  value: number; // Percentage or count
  color: string;
}

interface PieChartProps {
  title: string;
  chartData: VisitData[];
  cardStyle?: React.CSSProperties;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  chartData,
  cardStyle,
}) => {
  // Prepare data for ApexCharts
  const chartSeries = chartData.map(item => item.value);
  const chartLabels = chartData.map(item => item.type);
  const chartColors = chartData.map(item => item.color);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'pie',
      height: 230,
      background: 'transparent',
      animations: {
        enabled: false
      }
    },
    labels: chartLabels,
    colors: chartColors,
    legend: {
      show: false // Using custom legend
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        colors: ['#d9d9d9']
      },
      formatter: function(val: any) {
        return Math.round(val) + '%';
      },
      offset: 30,
      dropShadow: {
        enabled: false
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        dataLabels: {
          offset: 30,
          minAngleToShowLabel: 10
        }
      }
    },
    stroke: {
      width: 0
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: function(val: number) {
          return val + '%';
        }
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const label = w.globals.labels[seriesIndex];
        const value = series[seriesIndex];
        return `
          <div style="padding: 8px 12px; background: rgba(0,0,0,0.75); color: white; box-shadow: 0px 0px 10px rgba(0,0,0,0.5); border-radius: 4px;">
            <div>${label}: ${value}%</div>
          </div>`;
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1
        }
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.1
        }
      }
    }
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
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="pie"
        height={230}
      />
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
      <DebugOverlay fileName="PieChart.tsx" componentName="PieChart" />
    </Card>
  );
};

export default PieChart;

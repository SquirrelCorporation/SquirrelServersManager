import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import DebugOverlay from './DebugOverlay';

interface LegendItem {
  name: string;
  value: string;
  color: string;
}
interface DonutChartProps {
  title: string;
  totalTours: number;
  mainLabel: string; // e.g., "Tours"
  chartData: Array<{ type: string; value: number; color: string }>;
  legendItems: LegendItem[];
  cardStyle?: React.CSSProperties;
}

const DonutChart: React.FC<DonutChartProps> = ({
  title,
  totalTours = 0,
  mainLabel = 'Tours',
  chartData = [],
  legendItems = [],
  cardStyle,
}) => {
  // Prepare data for ApexCharts - handle undefined chartData
  const chartSeries = chartData?.map(item => item.value) || [];
  const chartLabels = chartData?.map(item => item.type) || [];
  const chartColors = chartData?.map(item => item.color) || [];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 220,
      background: 'transparent',
      animations: {
        enabled: false
      }
    },
    labels: chartLabels,
    colors: chartColors,
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: mainLabel,
              fontSize: '13px',
              color: '#8c8c8c',
              formatter: function() {
                return totalTours.toString();
              }
            },
            value: {
              show: true,
              fontSize: '30px',
              fontWeight: 600,
              color: '#f0f0f0',
              offsetY: -10
            },
            name: {
              show: false
            }
          }
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
          return val + ' tours';
        }
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const label = w.globals.labels[seriesIndex];
        const value = series[seriesIndex];
        return `
          <div style="padding: 8px 12px; background: rgba(0,0,0,0.75); color: white; box-shadow: 0px 0px 10px rgba(0,0,0,0.5); border-radius: 4px;">
            <div>${label}: ${value} tours</div>
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
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="donut"
        height={220}
      />
      <Space
        direction="vertical"
        size={8}
        style={{ marginTop: '24px', width: '100%' }}
      >
        {legendItems?.map((item) => (
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
      <DebugOverlay fileName="DonutChart.tsx" componentName="DonutChart" />
    </Card>
  );
};
export default DonutChart;

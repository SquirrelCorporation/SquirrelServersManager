import React from 'react';
import { Card, Typography, Space } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface OSDownloadData {
  type: string; // OS Name
  value: number; // Count or percentage
  color: string;
}

interface DonutChartWithTableProps {
  title: string;
  subtitle: string;
  totalDownloadsLabel: string; // e.g. "Total"
  totalDownloadsValue: string;
  chartData: OSDownloadData[];
  cardStyle?: React.CSSProperties;
}

const DonutChartWithTable: React.FC<DonutChartWithTableProps> = ({
  title,
  subtitle,
  totalDownloadsLabel,
  totalDownloadsValue,
  chartData,
  cardStyle,
}) => {
  // Prepare data for ApexCharts
  const chartSeries = chartData.map(item => item.value);
  const chartLabels = chartData.map(item => item.type);
  const chartColors = chartData.map(item => item.color);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 230,
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
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: totalDownloadsLabel,
              fontSize: '14px',
              fontWeight: 400,
              color: '#8c8c8c',
              formatter: function() {
                return totalDownloadsValue;
              }
            },
            value: {
              show: true,
              fontSize: '28px',
              fontWeight: 600,
              color: '#f0f0f0',
              offsetY: -12
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
          return val.toString();
        }
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const label = w.globals.labels[seriesIndex];
        const value = series[seriesIndex];
        return `
          <div style="padding: 8px 12px; background: rgba(0,0,0,0.75); color: white; box-shadow: 0px 0px 10px rgba(0,0,0,0.5); border-radius: 4px;">
            <div>${label}: ${value}</div>
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
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="donut"
        height={230}
      />
      {/* Legend can be added here if needed, similar to DonutChart */}
    </Card>
  );
};

export default DonutChartWithTable;

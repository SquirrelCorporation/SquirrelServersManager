import Devicestatus from '@/utils/devicestatus';
import { InfoCircleFilled } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useModel } from '@umijs/max';
import { Tooltip, Typography, Card, Skeleton } from 'antd';
import React, { useMemo, useState } from 'react';
import { API } from 'ssm-shared-lib';

const CombinedPowerCard: React.FC = () => {
  const [loading] = useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser: API.CurrentUser } = initialState || {};

  // Prepare data for ApexCharts
  const chartData = useMemo(() => {
    const devices = currentUser?.devices?.overview?.filter((e) => e.status !== Devicestatus.UNMANAGED) || [];
    
    // Calculate percentages for each device
    const cpuData = devices.map((device, index) => {
      const percentage = ((device.cpu || 0) / (currentUser?.devices?.totalCpu || 1)) * 100;
      return percentage;
    });
    
    const memData = devices.map((device, index) => {
      const memGb = (device.mem || 0) / (1024 * 1024 * 1024);
      const totalMemGb = (currentUser?.devices?.totalMem || 0) / (1024 * 1024 * 1024);
      const percentage = (memGb / (totalMemGb || 1)) * 100;
      return percentage;
    });
    
    // Create series for each device
    const series = devices.map((device, index) => ({
      name: device.name || `Device ${index + 1}`,
      data: [cpuData[index], memData[index]]
    }));
    
    return series;
  }, [currentUser]);

  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height: 60,
      stacked: true,
      stackType: '100%',
      toolbar: {
        show: false
      },
      background: 'transparent',
      animations: {
        enabled: false
      },
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '100%',
        distributed: false
      }
    },
    colors: [
      '#52c41a',
      '#faad14',
      '#1890ff',
      '#722ed1',
      '#fa8c16',
      '#13c2c2',
      '#eb2f96',
      '#a0d911',
      '#fa541c',
      '#2f54eb'
    ],
    xaxis: {
      categories: ['CPU', 'Memory'],
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false
    },
    grid: {
      show: false,
      padding: {
        top: -10,
        right: 0,
        bottom: -10,
        left: 0
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${value.toFixed(2)}%`
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const category = w.globals.labels[dataPointIndex];
        let tooltipHtml = `
          <div style="padding: 12px; background: #1a1a1a; border: 1px solid #3a3a3e; border-radius: 4px;">
            <div style="color: #d9d9d9; font-size: 14px; margin-bottom: 8px;">${category}</div>`;
        
        series.forEach((s: number[], sIndex: number) => {
          const value = s[dataPointIndex];
          const seriesName = w.globals.seriesNames[sIndex];
          const color = w.globals.colors[sIndex];
          
          if (value > 0) {
            tooltipHtml += `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%; margin-right: 8px;"></div>
                <span style="color: #8c8c8c; margin-right: 8px;">${seriesName}:</span>
                <span style="color: #d9d9d9;">${value.toFixed(2)}%</span>
              </div>`;
          }
        });
        
        tooltipHtml += '</div>';
        return tooltipHtml;
      }
    },
    fill: {
      opacity: 0.8,
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.05
        }
      }
    }
  }), []);

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
          Combined Power
        </Typography.Title>
        <Tooltip title="Sum of all your devices">
          <InfoCircleFilled style={{ color: '#8c8c8c', fontSize: '14px' }} />
        </Tooltip>
      </div>

      {/* Total Resources - Compact */}
      <div style={{ marginBottom: '12px' }}>
        <div>
          <Typography.Text style={{ color: '#52c41a', fontSize: '20px', fontWeight: 600 }}>
            {currentUser?.devices?.totalCpu?.toFixed(1)} GHz
          </Typography.Text>
          <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px', margin: '0 6px' }}>
            /
          </Typography.Text>
          <Typography.Text style={{ color: '#52c41a', fontSize: '20px', fontWeight: 600 }}>
            {(currentUser?.devices?.totalMem ? currentUser?.devices?.totalMem / (1024 * 1024 * 1024) : 0)?.toFixed(0)} GB
          </Typography.Text>
        </div>
      </div>

      {/* Device Count */}
      <div style={{ marginBottom: '12px' }}>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
          Of
        </Typography.Text>
        <Typography.Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500, marginLeft: '6px' }}>
          {currentUser?.devices?.overview?.length} devices
        </Typography.Text>
      </div>

      {/* Bar Chart - Smaller */}
      <div style={{ marginTop: '12px' }}>
        <ReactApexChart
          options={chartOptions}
          series={chartData}
          type="bar"
          height={60}
        />
      </div>
    </Card>
  );
};

export default React.memo(CombinedPowerCard);
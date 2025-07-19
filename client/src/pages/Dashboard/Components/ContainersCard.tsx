import {
  getAveragedStats,
  getNbContainersByStatus,
} from '@/services/rest/containers/container-statistics';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography, Card, Skeleton } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API, SsmStatus } from 'ssm-shared-lib';

const ContainersCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [nbRunning, setNbRunning] = useState<number>(0);
  const [nbTotal, setNbTotal] = useState<number>(0);
  const [stats, setStats] = useState<{ date: string; value: string; type: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [runningResponse, totalResponse, statsResponse] = await Promise.all(
          [
            getNbContainersByStatus(SsmStatus.ContainerStatus.RUNNING),
            getNbContainersByStatus('all'),
            getAveragedStats(),
          ],
        );

        setNbRunning(runningResponse.data);
        setNbTotal(totalResponse.data);
        const formattedStats = [
          ...(statsResponse.data?.cpuStats ?? []).map((e: API.ContainerStat) => ({
            type: 'cpu',
            value: `${e.value}`,
            date: moment(e.date, 'YYYY-MM-DD-HH-mm-ss').format(
              'YYYY-MM-DD, HH:mm',
            ),
          })),
          ...(statsResponse.data?.memStats ?? []).map((e: API.ContainerStat) => ({
            type: 'mem',
            value: `${e.value}`,
            date: moment(e.date, 'YYYY-MM-DD-HH-mm-ss').format(
              'YYYY-MM-DD, HH:mm',
            ),
          })),
        ];
        setStats(formattedStats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - runs once on mount

  // Prepare data for ApexCharts
  const chartData = useMemo(() => {
    // Group data by type
    const cpuData = stats.filter(s => s.type === 'cpu')
      .map(s => ({
        x: new Date(s.date).getTime(),
        y: parseFloat(s.value)
      }))
      .sort((a, b) => a.x - b.x);
    
    const memData = stats.filter(s => s.type === 'mem')
      .map(s => ({
        x: new Date(s.date).getTime(),
        y: parseFloat(s.value)
      }))
      .sort((a, b) => a.x - b.x);
    
    return [
      { name: 'CPU', data: cpuData },
      { name: 'Memory', data: memData }
    ];
  }, [stats]);

  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      height: 40,
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      },
      background: 'transparent',
      animations: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 1.5
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    colors: ['#52c41a', '#faad14'],
    xaxis: {
      type: 'datetime',
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
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM HH:mm'
      },
      y: {
        formatter: (value: number) => `${value.toFixed(2)}%`
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
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
          Container Status
        </Typography.Title>
        <Tooltip title="The containers running on your devices and the averaged usage statistics">
          <InfoCircleFilled style={{ color: '#8c8c8c', fontSize: '14px' }} />
        </Tooltip>
      </div>

      {/* Container Stats */}
      <div style={{ marginBottom: '12px' }}>
        <Typography.Text style={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}>
          {nbRunning}
        </Typography.Text>
        <Typography.Text style={{ color: '#52c41a', fontSize: '14px', marginLeft: '8px' }}>
          Running
        </Typography.Text>
      </div>

      {/* Total Containers */}
      <div style={{ marginBottom: '12px' }}>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
          Out of
        </Typography.Text>
        <Typography.Text style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500, marginLeft: '6px' }}>
          {nbTotal} total
        </Typography.Text>
      </div>

      {/* Mini Chart - Smaller for small card */}
      <div style={{ marginTop: '12px' }}>
        <ReactApexChart
          options={chartOptions}
          series={chartData}
          type="area"
          height={40}
        />
      </div>
    </Card>
  );
};

export default React.memo(ContainersCard);
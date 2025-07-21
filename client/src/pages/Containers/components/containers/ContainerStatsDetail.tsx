import { getContainerStats } from '@/services/rest/containers/container-statistics';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import moment from 'moment';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

export type ContainerStatsDetailProps = {
  containerId?: string;
  type: string;
};

const ContainerStatsDetail: React.FC<ContainerStatsDetailProps> = ({
  containerId,
  type,
}) => {
  const [data, setData] = React.useState<API.ContainerStat[] | undefined>();

  const formatData = (list: API.ContainerStats) => {
    return list?.data
      ? list.data
          .map((e: { date: string; value: number }) => {
            return {
              date: moment(e.date, 'YYYY-MM-DD-HH-mm-ss').format(
                'YYYY-MM-DD, HH:mm',
              ),
              value: e.value ? parseFloat(e.value.toFixed(2)) : NaN,
            };
          })
          .reduce((accumulator: API.ContainerStat[], current) => {
            if (!accumulator.find((item) => item.date === current.date)) {
              accumulator.push(current);
            }
            return accumulator;
          }, [])
      : [];
  };

  const asyncFetch = async () => {
    if (!containerId) {
      return;
    }
    getContainerStats(containerId, type).then((e) => {
      setData(formatData(e));
    });
  };

  useEffect(() => {
    asyncFetch();
  }, []);

  // Prepare data for ApexCharts
  const chartData = data ? data.map(item => item.value).filter(v => !isNaN(v)) : [];
  const categories = data ? data.map(item => item.date) : [];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      background: 'transparent'
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#52c41a'],
    xaxis: {
      categories: categories,
      labels: {
        show: false,
        style: {
          colors: '#fff'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#fff',
          fontSize: '11px'
        },
        formatter: (value) => `${value}%`
      },
      min: 0,
      max: (max) => {
        return Math.ceil(max / 10) * 10; // Round up to nearest 10
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        left: 20,
        right: 10,
        top: 10,
        bottom: 10
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true
      },
      y: {
        formatter: (value) => `${value}%`
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    }
  };

  const series = [{
    name: type === 'cpu' ? 'CPU Usage' : 'Memory Usage',
    data: chartData
  }];

  return (
    <div style={{ width: '280px', height: '150px' }}>
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="line"
        height={150}
        width={280}
      />
    </div>
  );
};

export default ContainerStatsDetail;
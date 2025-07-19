import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Typography, Space, Select, Spin, Empty } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import DebugPanel from './DebugPanel';
import DebugOverlay from './DebugOverlay';
import { 
  getDashboardDevicesStats,
  getDashboardAveragedDevicesStats 
} from '@/services/rest/statistics/stastistics';
import { 
  getContainerStats,
  getAveragedStats 
} from '@/services/rest/containers/container-statistics';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getContainers as getAllContainers } from '@/services/rest/containers/containers';
import { getTimeDistance } from '@/utils/time';
import { API, StatsType } from 'ssm-shared-lib';
import moment from 'moment';

// Static mapping outside component to avoid useCallback dependency issues
const STATS_TYPE_MAPPING: Record<string, StatsType.DeviceStatsType> = {
  cpu_usage: StatsType.DeviceStatsType.CPU,
  memory_usage: StatsType.DeviceStatsType.MEM_USED,
  memory_free: StatsType.DeviceStatsType.MEM_FREE,
  storage_usage: StatsType.DeviceStatsType.DISK_USED,
  storage_free: StatsType.DeviceStatsType.DISK_FREE,
  containers: StatsType.DeviceStatsType.CONTAINERS,
};

interface VisitEntry {
  month: string;
  team: string;
  visits: number;
}

interface GroupedBarChartProps {
  title: string;
  subtitle: string;
  // Legacy static props (optional for backward compatibility)
  chartData?: VisitEntry[];
  categoryColors?: Record<string, string>;
  cardStyle?: React.CSSProperties;
  // API-driven props
  dataType?: 'device' | 'container';
  source?: string | string[];
  metrics?: string[];
  dateRangePreset?: string;
  customDateRange?: [moment.Moment, moment.Moment];
  isPreview?: boolean;
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  title,
  subtitle,
  // Legacy props
  chartData,
  categoryColors,
  cardStyle,
  // API props
  dataType = 'device',
  source = 'all',
  metrics = ['cpu_usage', 'memory_usage'],
  dateRangePreset = 'last7days',
  customDateRange,
  isPreview = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<any[] | undefined>([]);
  const [currentPeriod, setCurrentPeriod] = useState(dateRangePreset);
  const [rangePickerValue, setRangePickerValue] = useState<any>(null);
  const [deviceNameMap, setDeviceNameMap] = useState<Record<string, string>>({});
  const [containerNameMap, setContainerNameMap] = useState<Record<string, string>>({});
  const [rawApiData, setRawApiData] = useState<any[]>([]);

  // If legacy chartData is provided, use it instead of API
  const isLegacyMode = chartData && chartData.length > 0;

  // Convert date range preset to actual dates (stable function)
  const getDateRangeFromPreset = useCallback((preset: string, customRange?: any) => {
    if (preset === 'custom' && customRange) {
      return customRange;
    }

    switch (preset) {
      case 'last24hours':
        return getTimeDistance('today');
      case 'last7days':
        return getTimeDistance('week');
      case 'last30days':
        return getTimeDistance('month');
      case 'last3months':
        return [moment().subtract(3, 'months'), moment()];
      case 'last6months':
        return [moment().subtract(6, 'months'), moment()];
      case 'lastyear':
        return getTimeDistance('year');
      default:
        return getTimeDistance('week');
    }
  }, []);

  // Initialize date range only once
  useEffect(() => {
    if (!rangePickerValue && !isLegacyMode) {
      const initialRange = getDateRangeFromPreset(dateRangePreset, customDateRange);
      setRangePickerValue(initialRange);
    }
  }, [dateRangePreset, customDateRange, getDateRangeFromPreset, isLegacyMode]);


  // Determine if we're looking at all items or specific ones (memoized)
  const { isAllSelected, sourceIds } = useMemo(() => {
    const isAll = Array.isArray(source) ? source.includes('all') : source === 'all';
    let ids: string[] = [];
    
    if (Array.isArray(source)) {
      ids = source.filter(s => s && s !== 'all');
    } else if (source && source !== 'all') {
      ids = [source];
    }
    
    return { isAllSelected: isAll, sourceIds: ids };
  }, [source]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (rangePickerValue && !isLegacyMode) {
      if (isPreview) {
        // Use mock data in preview mode
        const mockData = Array.from({ length: 6 }, (_, i) => ({
          name: `device-${i % 2 + 1}`,
          value: Math.floor(Math.random() * 40) + 30,
          date: moment().subtract(6 - i, 'months').format('YYYY-MM'),
        }));
        setGraphData(mockData);
        setLoading(false);
      } else {
        const fetchData = async () => {
          setLoading(true);
          try {
            if (dataType === 'device') {
              let deviceIds = sourceIds;
              
              // If "all" is selected, fetch all device IDs
              if (isAllSelected) {
                const devicesResponse = await getAllDevices();
                const devices = devicesResponse.data || [];
                deviceIds = devices.map(device => device.uuid);
                
                // Build device name mapping
                const nameMap: Record<string, string> = {};
                devices.forEach(device => {
                  nameMap[device.uuid] = device.fqdn || device.ip || device.uuid;
                });
                setDeviceNameMap(nameMap);
              } else {
                // For specific devices, fetch their details to get names
                const devicesResponse = await getAllDevices();
                const devices = devicesResponse.data || [];
                const nameMap: Record<string, string> = {};
                devices.forEach(device => {
                  if (sourceIds.includes(device.uuid)) {
                    nameMap[device.uuid] = device.fqdn || device.ip || device.uuid;
                  }
                });
                setDeviceNameMap(nameMap);
              }

              if (deviceIds.length === 0) {
                setGraphData([]);
                return;
              }

              // Use the primary metric for the chart
              const primaryMetric = metrics[0] || 'cpu_usage';
              const statsType = STATS_TYPE_MAPPING[primaryMetric] || StatsType.DeviceStatsType.CPU;
              
              // Fetch data using the same pattern as MainChartCard
              const deviceStats = await getDashboardDevicesStats(
                deviceIds as string[], 
                statsType, 
                {
                  from: rangePickerValue[0].toDate(),
                  to: rangePickerValue[1].toDate(),
                }
              );
              
              // Store raw API data for debugging
              setRawApiData(deviceStats.data || []);
              
              // Process the data - keep the original structure
              const processedData = deviceStats.data || [];
              setGraphData(processedData);
            }
          } catch (error) {
            console.error('Failed to fetch chart data:', error);
            setGraphData([]);
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }
    }
  }, [dataType, sourceIds, isAllSelected, metrics, rangePickerValue, isLegacyMode, isPreview]);

  // Legacy data processing for static chartData
  const legacyProcessedData = useMemo(() => {
    if (!isLegacyMode || !chartData) return { categories: [], series: [] };
    
    // Get unique months in order
    const months = Array.from(new Set(chartData.map(item => item.month)));
    
    // Get unique teams
    const teams = Array.from(new Set(chartData.map(item => item.team)));
    
    // Create series data for each team
    const seriesData = teams.map(team => {
      const data = months.map(month => {
        const entry = chartData.find(item => item.month === month && item.team === team);
        return entry ? entry.visits : 0;
      });
      
      return {
        name: team,
        data: data
      };
    });
    
    return {
      categories: months,
      series: seriesData
    };
  }, [chartData, isLegacyMode]);

  // API data processing - group by device and create monthly aggregations
  const apiProcessedData = useMemo(() => {
    if (isLegacyMode || !graphData || graphData.length === 0) return { categories: [], series: [] };
    
    // Group data by device and aggregate by month
    const dataByDevice: Record<string, Record<string, number[]>> = {};
    
    graphData.forEach(stat => {
      const deviceName = deviceNameMap[stat.name] || stat.name;
      
      // Parse the custom date format and get month
      let parsedDate;
      if (typeof stat.date === 'string' && stat.date.includes('-') && stat.date.split('-').length > 3) {
        const parts = stat.date.split('-');
        if (parts.length >= 4) {
          const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}`;
          parsedDate = moment(dateStr);
        }
      } else {
        parsedDate = moment(stat.date);
      }
      
      if (!parsedDate.isValid()) return;
      
      const monthKey = parsedDate.format('MMM YYYY');
      
      if (!dataByDevice[deviceName]) {
        dataByDevice[deviceName] = {};
      }
      
      if (!dataByDevice[deviceName][monthKey]) {
        dataByDevice[deviceName][monthKey] = [];
      }
      
      dataByDevice[deviceName][monthKey].push(stat.value || 0);
    });
    
    // Get all unique months and sort them
    const allMonths = new Set<string>();
    Object.values(dataByDevice).forEach(deviceData => {
      Object.keys(deviceData).forEach(month => allMonths.add(month));
    });
    
    const sortedMonths = Array.from(allMonths).sort((a, b) => 
      moment(a, 'MMM YYYY').valueOf() - moment(b, 'MMM YYYY').valueOf()
    );
    
    // Create series for ApexCharts - average values per month per device
    const series = Object.entries(dataByDevice).slice(0, 2).map(([deviceName, monthData]) => {
      const data = sortedMonths.map(month => {
        const values = monthData[month] || [];
        return values.length > 0 
          ? values.reduce((sum, val) => sum + val, 0) / values.length 
          : 0;
      });
      
      return {
        name: deviceName,
        data: data
      };
    });
    
    return {
      categories: sortedMonths,
      series: series
    };
  }, [graphData, deviceNameMap, isLegacyMode]);

  // Use the appropriate processed data
  const { categories, series } = isLegacyMode ? legacyProcessedData : apiProcessedData;

  // Handle period changes
  const handlePeriodChange = useCallback((newPeriod: string) => {
    setCurrentPeriod(newPeriod);
    const newRange = getDateRangeFromPreset(newPeriod, customDateRange);
    setRangePickerValue(newRange);
  }, [customDateRange, getDateRangeFromPreset]);

  // Period options (stable)
  const periodOptions = useMemo(() => [
    { label: 'Last 24 Hours', value: 'last24hours' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 3 Months', value: 'last3months' },
    { label: 'Last 6 Months', value: 'last6months' },
  ], []);

  const getMetricLabel = useCallback((metric: string): string => {
    const labels: Record<string, string> = {
      cpu_usage: 'CPU Usage',
      memory_usage: 'Memory Usage',
      memory_free: 'Memory Free',
      storage_usage: 'Storage Usage',
      storage_free: 'Storage Free',
      containers: 'Containers',
    };
    return labels[metric] || metric;
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false
      },
      background: 'transparent',
      animations: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: ['#52c41a', '#faad14'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#8c8c8c',
          fontSize: '12px'
        }
      },
      axisBorder: {
        color: '#3a3a3e'
      },
      axisTicks: {
        color: '#3a3a3e'
      }
    },
    yaxis: {
      max: isLegacyMode ? 80 : (metrics.includes('containers') ? undefined : 100),
      tickAmount: 4,
      labels: {
        style: {
          colors: '#8c8c8c',
          fontSize: '11px'
        },
        formatter: (value) => {
          if (isLegacyMode) {
            return value.toString();
          }
          if (metrics.includes('containers')) {
            return Math.round(value).toString();
          }
          return `${value}%`;
        }
      }
    },
    grid: {
      borderColor: '#3a3a3e',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
          opacity: 0.3
        }
      },
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: {
        formatter: function(val: number) {
          if (isLegacyMode) {
            return val + ' visits';
          }
          if (metrics.includes('containers')) {
            return Math.round(val).toLocaleString();
          }
          return `${val.toFixed(2)}%`;
        }
      }
    },
    fill: {
      opacity: 1
    }
  };

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '28px 32px' }}
    >
      {/* Header with title and period selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Typography.Title
            level={4}
            style={{ 
              color: '#ffffff', 
              margin: 0, 
              fontSize: '20px',
              fontWeight: 600 
            }}
          >
            {title}
          </Typography.Title>
          <Typography.Text style={{ 
            color: '#52c41a', 
            fontSize: '14px',
            opacity: 0.8
          }}>
            {isLegacyMode ? subtitle : metrics.map(m => getMetricLabel(m)).join(' vs ')}
          </Typography.Text>
        </div>
        {!isLegacyMode && dateRangePreset !== 'custom' && (
          <Select
            value={currentPeriod}
            onChange={handlePeriodChange}
            style={{ width: 150 }}
            options={periodOptions}
          />
        )}
      </div>
      
      {/* Legend */}
      <Space size={24} style={{ marginBottom: '24px', float: 'right' }}>
        {series.map((seriesItem, index) => (
          <Space key={seriesItem.name} size={8} align="center">
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: index === 0 ? '#52c41a' : '#faad14' 
            }} />
            <Typography.Text style={{ color: '#d9d9d9', fontSize: 13 }}>
              {isLegacyMode ? seriesItem.name : seriesItem.name}
            </Typography.Text>
          </Space>
        ))}
      </Space>
      
      <div style={{ clear: 'both' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Spin size="large" />
          </div>
        ) : series.length > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="bar"
            height={300}
          />
        ) : (
          <Empty
            description="No data available"
            style={{ marginTop: '100px' }}
          />
        )}
      </div>

      {!isLegacyMode && (
        <DebugPanel 
          componentName="GroupedBarChartCard"
          data={{
            rawApiData: rawApiData,
            processedGraphData: graphData,
            processedChartData: { categories, series },
            dataType,
            source,
            metrics,
            dateRange: currentPeriod,
            isLegacyMode,
          }}
        />
      )}
      <DebugOverlay fileName="GroupedBarChart.tsx" componentName="GroupedBarChart" />
    </Card>
  );
};

export default GroupedBarChart;

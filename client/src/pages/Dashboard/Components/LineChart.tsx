import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Typography, Space, Select, Spin, Empty } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
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
import { LoadingOutlined } from '@ant-design/icons';
import { API, StatsType } from 'ssm-shared-lib';
import moment from 'moment';
import './LineChart.css';
import DebugOverlay from './DebugOverlay';

// Static mapping outside component to avoid useCallback dependency issues
const STATS_TYPE_MAPPING: Record<string, StatsType.DeviceStatsType> = {
  cpu_usage: StatsType.DeviceStatsType.CPU,
  memory_usage: StatsType.DeviceStatsType.MEM_USED,
  memory_free: StatsType.DeviceStatsType.MEM_FREE,
  storage_usage: StatsType.DeviceStatsType.DISK_USED,
  storage_free: StatsType.DeviceStatsType.DISK_FREE,
  containers: StatsType.DeviceStatsType.CONTAINERS,
};

interface LineChartProps {
  title: string;
  cardStyle?: React.CSSProperties;
  // API-driven props
  dataType?: 'device' | 'container';
  source?: string | string[];
  metrics?: string[];
  dateRangePreset?: string;
  customDateRange?: [moment.Moment, moment.Moment];
  isPreview?: boolean; // Add flag to prevent data fetching in preview mode
  colorPalette?: string;
  customColors?: string[];
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  cardStyle,
  // API props
  dataType = 'device',
  source = 'all',
  metrics = ['cpu_usage', 'memory_usage'],
  dateRangePreset = 'last7days',
  customDateRange,
  isPreview = false,
  colorPalette = 'default',
  customColors = [],
}) => {
  console.log('🎨 LineChart received props:', { colorPalette, customColors });
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<any[] | undefined>([]);
  const [currentPeriod, setCurrentPeriod] = useState(dateRangePreset);
  const [rangePickerValue, setRangePickerValue] = useState<any>(null);
  const [deviceNameMap, setDeviceNameMap] = useState<Record<string, string>>({});
  const [containerNameMap, setContainerNameMap] = useState<Record<string, string>>({});


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
    if (!rangePickerValue) {
      const initialRange = getDateRangeFromPreset(dateRangePreset, customDateRange);
      setRangePickerValue(initialRange);
    }
  }, [dateRangePreset, customDateRange, getDateRangeFromPreset]);


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

  // Memoize metrics array to prevent unnecessary re-renders
  const memoizedMetrics = useMemo(() => metrics, [JSON.stringify(metrics)]);

  // Create stable string representation for date range to prevent infinite loops
  const rangePickerKey = useMemo(() => {
    if (!rangePickerValue) return null;
    return `${rangePickerValue[0]?.toISOString()}-${rangePickerValue[1]?.toISOString()}`;
  }, [rangePickerValue]);

  // Fetch data when dependencies change
  useEffect(() => {
    console.log('🔄 LineChart useEffect triggered with dependencies:', {
      dataType,
      sourceIds,
      isAllSelected,
      memoizedMetrics,
      rangePickerKey: rangePickerKey ? 'exists' : 'null',
      isPreview
    });
    
    if (rangePickerValue && rangePickerKey) {
      if (isPreview) {
        console.log('📊 Using mock data in preview mode');
        // Use mock data in preview mode
        const mockData = Array.from({ length: 20 }, (_, i) => ({
          name: `device-${i % 2 + 1}`,
          value: Math.floor(Math.random() * 40) + 30,
          date: moment().subtract(20 - i, 'hours').toISOString(),
        }));
        setGraphData(mockData);
        setLoading(false);
      } else {
        console.log('🌐 Starting data fetch for LineChart');
        const fetchData = async () => {
          console.log('⏳ Setting loading to true');
          setLoading(true);
          try {
            if (dataType === 'device') {
              console.log('🖥️ Processing device data type');
              let deviceIds = sourceIds;
              
              // If "all" is selected, fetch all device IDs
              if (isAllSelected) {
                console.log('📊 LineChart API Call: getAllDevices', { 
                  component: 'LineChart',
                  title,
                  timestamp: new Date().toISOString()
                });
                const devicesResponse = await getAllDevices();
                const devices = devicesResponse.data || [];
                deviceIds = devices.map(device => device.uuid);
                console.log('📊 LineChart API Response: getAllDevices', { 
                  component: 'LineChart',
                  title,
                  deviceCount: devices.length,
                  deviceIds,
                  timestamp: new Date().toISOString()
                });
                
                // Build device name mapping
                const nameMap: Record<string, string> = {};
                devices.forEach(device => {
                  nameMap[device.uuid] = device.fqdn || device.ip || device.uuid;
                });
                console.log('🏷️ Setting device name map:', nameMap);
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

              // Use the primary metric for the chart (following MainChartCard pattern)
              const primaryMetric = memoizedMetrics[0] || 'cpu_usage';
              const statsType = STATS_TYPE_MAPPING[primaryMetric] || StatsType.DeviceStatsType.CPU;
              console.log(`📊 Using metric: ${primaryMetric}, statsType: ${statsType}`);
              
              // Fetch data using the same pattern as MainChartCard
              console.log('📊 LineChart API Call: getDashboardDevicesStats', {
                component: 'LineChart',
                title,
                deviceIds,
                statsType,
                metric: primaryMetric,
                dateRange: {
                  from: rangePickerValue[0].toDate(),
                  to: rangePickerValue[1].toDate()
                },
                timestamp: new Date().toISOString()
              });
              
              const deviceStats = await getDashboardDevicesStats(
                deviceIds as string[], 
                statsType,
                {
                  from: rangePickerValue[0].toDate(),
                  to: rangePickerValue[1].toDate(),
                }
              );
              
              console.log('📊 LineChart API Response: getDashboardDevicesStats', {
                component: 'LineChart',
                title,
                dataLength: deviceStats.data?.length || 0,
                rawData: deviceStats.data,
                timestamp: new Date().toISOString()
              });
              // Process the data - keep the original structure
              const processedData = deviceStats.data || [];
              console.log('💾 Setting graph data:', processedData);
              setGraphData(processedData);
            } else if (dataType === 'container') {
              // For containers, we'll need to adapt the data format to match API.DeviceStat
              let containerIds = sourceIds;
              
              if (isAllSelected) {
                const containersResponse = await getAllContainers();
                const containers = containersResponse.data || [];
                containerIds = containers.map(container => container.id);
                
                // Build container name mapping
                const nameMap: Record<string, string> = {};
                containers.forEach(container => {
                  nameMap[container.id] = container.customName || container.name || container.id;
                });
                setContainerNameMap(nameMap);
              } else {
                // For specific containers, fetch their details to get names
                const containersResponse = await getAllContainers();
                const containers = containersResponse.data || [];
                const nameMap: Record<string, string> = {};
                containers.forEach(container => {
                  if (sourceIds.includes(container.id)) {
                    nameMap[container.id] = container.customName || container.name || container.id;
                  }
                });
                setContainerNameMap(nameMap);
              }

              if (containerIds.length === 0) {
                setGraphData([]);
                return;
              }

              // For now, we'll use a simplified approach for containers
              // This can be expanded to use container-specific APIs
              setGraphData([]);
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
  }, [dataType, sourceIds, isAllSelected, memoizedMetrics, rangePickerKey, isPreview]);

  const getMetricLabel = useCallback((metric: string): string => {
    const labels: Record<string, string> = {
      cpu_usage: 'CPU Usage',
      memory_usage: 'Memory Usage',
      memory_free: 'Memory Free',
      storage_usage: 'Storage Usage',
      storage_free: 'Storage Free',
      containers: 'Containers',
      container_cpu_usage: 'CPU Usage',
      container_memory_usage: 'Memory Usage',
    };
    return labels[metric] || metric;
  }, []);

  // Process data for charts - separate by device
  const processedChartData = useMemo(() => {
    if (!graphData || graphData.length === 0) return {};
    
    // Group data by device
    const dataByDevice: Record<string, Array<{ value: number; index: number; date: string }>> = {};
    
    // First, get all unique device names
    const deviceNames = new Set<string>();
    graphData.forEach(stat => {
      const deviceName = deviceNameMap[stat.name] || stat.name;
      deviceNames.add(deviceName);
    });
    
    // Initialize empty arrays for each device
    deviceNames.forEach(deviceName => {
      dataByDevice[deviceName] = [];
    });
    
    // Sort all data by date first to ensure consistent indexing
    const sortedData = [...graphData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get unique dates for consistent indexing across devices
    const uniqueDates = Array.from(new Set(sortedData.map(stat => stat.date)));
    
    // Populate data for each device with consistent indexing
    deviceNames.forEach(deviceName => {
      uniqueDates.forEach((date, index) => {
        const stat = sortedData.find(s => 
          s.date === date && (deviceNameMap[s.name] || s.name) === deviceName
        );
        if (stat) {
          dataByDevice[deviceName].push({
            value: stat.value || 0,
            index: index,
            date: stat.date
          });
        }
      });
    });
    
    return dataByDevice;
  }, [graphData, deviceNameMap]);

  // Handle period changes
  const handlePeriodChange = useCallback((newPeriod: string) => {
    setCurrentPeriod(newPeriod);
    const newRange = getDateRangeFromPreset(newPeriod, customDateRange);
    setRangePickerValue(newRange);
  }, [customDateRange, getDateRangeFromPreset]);

  // Color palette logic
  const getChartColors = useCallback(() => {
    if (customColors && customColors.length > 0) {
      return customColors;
    }
    
    const colorPalettes = {
      default: ['#52c41a', '#faad14', '#40a9ff', '#ff4d4f', '#722ed1'],
      vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'],
      cool: ['#74b9ff', '#0984e3', '#6c5ce7', '#a29bfe', '#fd79a8'],
      warm: ['#fd79a8', '#fdcb6e', '#e84393', '#fd79a8', '#ffeaa7'],
      nature: ['#00b894', '#55a3ff', '#fd79a8', '#fdcb6e', '#74b9ff'],
    };
    
    return colorPalettes[colorPalette] || colorPalettes.default;
  }, [colorPalette, customColors]);

  // Period options (stable)
  const periodOptions = useMemo(() => [
    { label: 'Last 24 Hours', value: 'last24hours' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 3 Months', value: 'last3months' },
  ], []);

  // Generate stable mock data for preview mode
  const mockData = useMemo(() => {
    if (isPreview) {
      return [
        {
          name: 'Device 1',
          data: Array.from({ length: 20 }, (_, i) => ({
            x: new Date(Date.now() - (20 - i) * 3600000).toISOString(),
            y: 30 + (i * 2) + Math.sin(i * 0.5) * 10 // Stable deterministic data
          }))
        },
        {
          name: 'Device 2', 
          data: Array.from({ length: 20 }, (_, i) => ({
            x: new Date(Date.now() - (20 - i) * 3600000).toISOString(),
            y: 50 + (i * 1.5) + Math.cos(i * 0.3) * 8 // Stable deterministic data
          }))
        }
      ];
    }
    return [];
  }, [isPreview]);

  // Prepare data for ApexCharts
  const chartSeries = useMemo(() => {
    if (isPreview) {
      console.log('📊 LineChart using mockData:', mockData);
      return mockData;
    }
    
    if (Object.keys(processedChartData).length === 0) {
      console.log('⚠️ LineChart: No processed chart data available');
      return [];
    }
    
    const series = Object.entries(processedChartData).slice(0, 2).map((entry, index) => {
      const [deviceName, data] = entry;
      return {
        name: deviceName,
        data: data.map(point => ({
          x: point.date,
          y: point.value
        }))
      };
    });
    
    console.log('📈 LineChart series data:', series);
    return series;
  }, [processedChartData, isPreview, mockData]);

  const chartOptions: ApexOptions = useMemo(() => {
    const colors = getChartColors();
    console.log('🎨 Chart colors for palette:', colorPalette, '→', colors);
    
    const options: ApexOptions = {
      chart: {
        type: 'area',
        height: 300,
        width: '100%',
        toolbar: { show: false },
        background: 'transparent',
        dropShadow: {
          enabled: false
        }
      },
      stroke: {
        width: 2.5,
        curve: 'smooth',
        lineCap: 'round'
      },
      colors: colors,
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0,
        strokeWidth: 3,
        hover: {
          size: 6
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#8c8c8c',
            fontSize: '12px'
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
            colors: '#8c8c8c',
            fontSize: '12px'
          },
          formatter: function(val) {
            if (memoizedMetrics.includes('containers')) {
              return Math.round(val).toLocaleString();
            }
            return val.toFixed(1) + '%';
          }
        }
      },
      grid: {
        borderColor: '#3a3a3e',
        strokeDashArray: 3
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'dark'
      },
      fill: {
        opacity: 1,
        gradient: {
          type: 'vertical',
          shadeIntensity: 0,
          opacityFrom: 0.4,
          opacityTo: 0,
          stops: [0, 100]
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: '100%'
          }
        }
      }]
    };
    
    console.log('⚙️ Final chart options:', options);
    return options;
  }, [memoizedMetrics, getChartColors, colorPalette, customColors]);

  return (
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          color: 'white',
          border: 'none',
          height: '100%',
          width: '100%',
          ...cardStyle,
        }}
        bodyStyle={{ padding: '28px 32px', width: '100%' }}
      >
        {/* Header with title and period selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Typography.Title level={4} style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {title}
            </Typography.Title>
            <Typography.Text style={{ color: '#52c41a', fontSize: '14px', opacity: 0.8 }}>
              {memoizedMetrics.map(m => getMetricLabel(m)).join(' vs ')}
            </Typography.Text>
          </div>
          {dateRangePreset !== 'custom' && (
            <Select
              value={currentPeriod}
              onChange={handlePeriodChange}
              style={{ width: 150 }}
              options={periodOptions}
            />
          )}
        </div>

        {/* Chart with device stats and legend */}
        <Space direction="vertical" size={16} style={{ width: '100%', marginTop: '32px' }}>
          {/* Legend */}
          <Space size={32}>
            {Object.entries(processedChartData).slice(0, 2).map((entry, index) => {
              const [deviceName, data] = entry;
              const lastValue = data.length > 0 ? data[data.length - 1]?.value || 0 : 0;
              const valueStr = memoizedMetrics.includes('containers') 
                ? Math.round(lastValue).toLocaleString()
                : `${lastValue.toFixed(1)}%`;
              
              const chartColors = getChartColors();
              const currentColor = chartColors[index] || chartColors[0];
              
              return (
                <div key={deviceName} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: currentColor,
                    boxShadow: `0 0 8px ${currentColor}`,
                  }} />
                  <div>
                    <Typography.Text style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>
                      {valueStr}
                    </Typography.Text>
                    <Typography.Text style={{ color: '#8c8c8c', fontSize: '13px', marginLeft: '8px' }}>
                      {deviceName}
                    </Typography.Text>
                  </div>
                </div>
              );
            })}
          </Space>
          
          {/* Charts */}
          <div className="line-chart-container" style={{ position: 'relative', height: '300px', width: '100%', maxWidth: '100%' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Spin size="large" />
              </div>
            ) : chartSeries.length > 0 ? (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height="100%"
                width="100%"
              />
            ) : (
              <Empty
                description="No data available"
                style={{ marginTop: '50px' }}
              />
            )}
          </div>
        </Space>
        <DebugOverlay fileName="LineChart.tsx" componentName="LineChart" />
      </Card>
    );
};

export default LineChart;
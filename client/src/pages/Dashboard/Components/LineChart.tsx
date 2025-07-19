import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Typography, Space, Select, Spin, Empty } from 'antd';
import { Tiny } from '@ant-design/plots';
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
}) => {
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

  // Convert metric names to StatsType enum values (stable function)
  const getStatsType = useCallback((metric: string): StatsType.DeviceStatsType => {
    const mapping: Record<string, StatsType.DeviceStatsType> = {
      cpu_usage: StatsType.DeviceStatsType.CPU,
      memory_usage: StatsType.DeviceStatsType.MEM_USED,
      memory_free: StatsType.DeviceStatsType.MEM_FREE,
      storage_usage: StatsType.DeviceStatsType.DISK_USED,
      storage_free: StatsType.DeviceStatsType.DISK_FREE,
      containers: StatsType.DeviceStatsType.CONTAINERS,
    };
    return mapping[metric] || StatsType.DeviceStatsType.CPU;
  }, []);

  // Determine if we're looking at all items or specific ones (memoized)
  const { isAllSelected, sourceIds } = useMemo(() => {
    const isAll = Array.isArray(source) ? source.includes('all') : source === 'all';
    const ids = Array.isArray(source) ? source.filter(s => s !== 'all') : [source];
    return { isAllSelected: isAll, sourceIds: ids };
  }, [source]);

  const fetchData = useCallback(async () => {
    if (!rangePickerValue) return;
    
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

        // Use the primary metric for the chart (following MainChartCard pattern)
        const primaryMetric = metrics[0] || 'cpu_usage';
        const statsType = getStatsType(primaryMetric);
        
        // Fetch data using the same pattern as MainChartCard
        const deviceStats = await getDashboardDevicesStats(
          deviceIds as string[], 
          statsType, 
          {
            from: rangePickerValue[0].toDate(),
            to: rangePickerValue[1].toDate(),
          }
        );
        
        // Process the data - keep the original structure
        const processedData = deviceStats.data || [];
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
  }, [dataType, sourceIds, isAllSelected, metrics, rangePickerValue, getStatsType]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (rangePickerValue) {
      if (isPreview) {
        // Use mock data in preview mode
        const mockData = Array.from({ length: 20 }, (_, i) => ({
          name: `device-${i % 2 + 1}`,
          value: Math.floor(Math.random() * 40) + 30,
          date: moment().subtract(20 - i, 'hours').toISOString(),
        }));
        setGraphData(mockData);
        setLoading(false);
      } else {
        fetchData();
      }
    }
  }, [fetchData, rangePickerValue, isPreview]);

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

  // Period options (stable)
  const periodOptions = useMemo(() => [
    { label: 'Last 24 Hours', value: 'last24hours' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 3 Months', value: 'last3months' },
  ], []);

  return (
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          color: 'white',
          border: 'none',
          height: '100%',
          ...cardStyle,
        }}
        bodyStyle={{ padding: '28px 32px' }}
      >
        {/* Header with title and period selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Typography.Title level={4} style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {title}
            </Typography.Title>
            <Typography.Text style={{ color: '#52c41a', fontSize: '14px', opacity: 0.8 }}>
              {metrics.map(m => getMetricLabel(m)).join(' vs ')}
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
              const valueStr = metrics.includes('containers') 
                ? Math.round(lastValue).toLocaleString()
                : `${lastValue.toFixed(1)}%`;
              
              return (
                <div key={deviceName} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: index === 0 ? '#52c41a' : '#faad14',
                    boxShadow: `0 0 8px ${index === 0 ? '#52c41a' : '#faad14'}`,
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
          <div style={{ position: 'relative', height: '200px', width: '100%' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Spin size="large" />
              </div>
            ) : Object.keys(processedChartData).length > 0 ? (
              <>
                {Object.entries(processedChartData).slice(0, 2).map((entry, index) => {
                  const [deviceName, data] = entry;
                  
                  const config = {
                    data: data,
                    width: 800,
                    height: 200,
                    autoFit: false,
                    shapeField: 'smooth',
                    xField: 'index',
                    yField: 'value',
                    padding: [30, 30, 30, 30],
                    tooltip: {
                      channel: 'y',
                      title: deviceName,
                      valueFormatter: (val: number) => {
                        if (metrics.includes('containers')) {
                          return Math.round(val).toLocaleString();
                        }
                        return `${val.toFixed(2)}%`;
                      },
                    },
                    interaction: { tooltip: { mount: 'body' } },
                    style: {
                      lineWidth: 4,
                      stroke: index === 0 ? '#52c41a' : '#faad14',
                      shadowColor: index === 0 ? '#52c41a' : '#faad14',
                      shadowBlur: 15,
                    },
                  };
                  
                  return (
                    <div 
                      key={deviceName}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
                      }}
                    >
                      <Tiny.Line {...config} />
                    </div>
                  );
                })}
              </>
          ) : (
            <Empty
              description="No data available"
              style={{ marginTop: '50px' }}
            />
          )}
        </div>
        </Space>
      </Card>
    );
};

export default LineChart;
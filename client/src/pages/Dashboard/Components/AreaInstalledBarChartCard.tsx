import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Typography, Space, Select, Row, Col, Spin, Empty } from 'antd';
import { Column } from '@ant-design/charts';
import type { ColumnConfig } from '@ant-design/plots';
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

interface InstallData {
  month: string; // Or other time unit
  region: string; // e.g. "Asia", "Europe"
  installs: number;
}

interface AreaInstalledBarChartCardProps {
  title: string;
  subtitle?: string;
  currentYear?: string | number;
  availableYears?: Array<string | number>;
  onYearChange?: (year: string | number) => void;
  chartData?: InstallData[];
  regionColors?: Record<string, string>; // e.g. { Asia: '#ffc53d', Europe: '#40a9ff', Americas: '#52c41a' }
  cardStyle?: React.CSSProperties;
  // API-driven props
  dataType?: 'device' | 'container';
  source?: string | string[];
  metric?: string;
  dateRangePreset?: string;
  customDateRange?: [moment.Moment, moment.Moment];
  isPreview?: boolean;
}

const AreaInstalledBarChartCard: React.FC<AreaInstalledBarChartCardProps> = ({
  title,
  subtitle,
  currentYear,
  availableYears,
  onYearChange,
  chartData: staticChartData,
  regionColors,
  cardStyle,
  // API props
  dataType = 'device',
  source = 'all',
  metric = 'cpu_usage',
  dateRangePreset = 'last7days',
  customDateRange,
  isPreview = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiChartData, setApiChartData] = useState<InstallData[]>([]);
  const [deviceNameMap, setDeviceNameMap] = useState<Record<string, string>>({});
  const [containerNameMap, setContainerNameMap] = useState<Record<string, string>>({});

  // Use static data if provided, otherwise use API data
  const chartData = staticChartData || apiChartData;

  // Convert date range preset to actual dates
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

  // Convert metric names to StatsType enum values
  const getStatsType = useCallback((metricName: string): StatsType.DeviceStatsType => {
    const mapping: Record<string, StatsType.DeviceStatsType> = {
      cpu_usage: StatsType.DeviceStatsType.CPU,
      memory_usage: StatsType.DeviceStatsType.MEM_USED,
      memory_free: StatsType.DeviceStatsType.MEM_FREE,
      storage_usage: StatsType.DeviceStatsType.DISK_USED,
      storage_free: StatsType.DeviceStatsType.DISK_FREE,
      containers: StatsType.DeviceStatsType.CONTAINERS,
    };
    return mapping[metricName] || StatsType.DeviceStatsType.CPU;
  }, []);

  // Determine if we're looking at all items or specific ones
  const { isAllSelected, sourceIds } = useMemo(() => {
    const isAll = Array.isArray(source) ? source.includes('all') : source === 'all';
    const ids = Array.isArray(source) ? source.filter(s => s !== 'all') : [source];
    return { isAllSelected: isAll, sourceIds: ids };
  }, [source]);

  // Fetch name mappings
  useEffect(() => {
    const fetchNameMappings = async () => {
      if (dataType === 'device') {
        try {
          const response = await getAllDevices();
          if (response.data) {
            const nameMap: Record<string, string> = {};
            response.data.forEach((device: API.Device) => {
              nameMap[device.uuid] = device.fqdn || device.ip || device.uuid;
            });
            setDeviceNameMap(nameMap);
          }
        } catch (error) {
          console.error('Failed to fetch devices:', error);
        }
      } else if (dataType === 'container') {
        try {
          const response = await getAllContainers();
          if (response.data) {
            const nameMap: Record<string, string> = {};
            response.data.forEach((container: API.Container) => {
              nameMap[container.id] = container.customName || container.name || container.id;
            });
            setContainerNameMap(nameMap);
          }
        } catch (error) {
          console.error('Failed to fetch containers:', error);
        }
      }
    };

    if (!staticChartData) {
      fetchNameMappings();
    }
  }, [dataType, staticChartData]);

  // Fetch chart data
  useEffect(() => {
    if (staticChartData) return; // Skip if using static data

    const fetchData = async () => {
      setLoading(true);
      try {
        // Use mock data in preview mode
        if (isPreview) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          const sources = ['Source A', 'Source B', 'Source C'];
          const mockData = months.flatMap(month => 
            sources.map(source => ({
              month,
              region: source,
              installs: Math.floor(Math.random() * 50) + 10,
            }))
          );
          setApiChartData(mockData);
          setLoading(false);
          return;
        }
        const dateRange = getDateRangeFromPreset(dateRangePreset, customDateRange);
        const [fromDate, toDate] = dateRange;
        const statsType = getStatsType(metric);

        let data: any[] = [];

        if (dataType === 'device') {
          if (isAllSelected) {
            // Get all device IDs
            const devicesResponse = await getAllDevices();
            const allDeviceIds = devicesResponse.data?.map(device => device.uuid) || [];
            
            const response = await getDashboardAveragedDevicesStats(
              allDeviceIds,
              statsType,
              {
                from: fromDate.toDate(),
                to: toDate.toDate(),
              }
            );
            data = response.data || [];
          } else {
            const promises = sourceIds.map(deviceId =>
              getDashboardDevicesStats(
                [deviceId],
                statsType,
                {
                  from: fromDate.toDate(),
                  to: toDate.toDate(),
                }
              )
            );
            const responses = await Promise.all(promises);
            responses.forEach((response, index) => {
              if (response.data) {
                const deviceData = response.data.map((item: any) => ({
                  ...item,
                  source: sourceIds[index],
                }));
                data = [...data, ...deviceData];
              }
            });
          }
        } else if (dataType === 'container') {
          if (isAllSelected) {
            const response = await getAveragedStats(
              fromDate.toISOString(),
              toDate.toISOString(),
              metric === 'container_cpu_usage' ? 'cpu' : 'memory'
            );
            data = response.data || [];
          } else {
            const promises = sourceIds.map(containerId =>
              getContainerStats(
                containerId,
                fromDate.toISOString(),
                toDate.toISOString(),
                metric === 'container_cpu_usage' ? 'cpu' : 'memory'
              )
            );
            const responses = await Promise.all(promises);
            responses.forEach((response, index) => {
              if (response.data) {
                const containerData = response.data.map((item: any) => ({
                  ...item,
                  source: sourceIds[index],
                }));
                data = [...data, ...containerData];
              }
            });
          }
        }

        // Transform data for stacked area chart
        const transformedData = transformDataForStackedChart(
          data,
          isAllSelected,
          dataType === 'device' ? deviceNameMap : containerNameMap
        );
        setApiChartData(transformedData);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    staticChartData,
    dataType,
    source,
    metric,
    dateRangePreset,
    customDateRange,
    isAllSelected,
    sourceIds,
    deviceNameMap,
    containerNameMap,
    getDateRangeFromPreset,
    getStatsType,
    isPreview,
  ]);

  // Transform API data to chart format
  const transformDataForStackedChart = (
    data: any[],
    isAll: boolean,
    nameMap: Record<string, string>
  ): InstallData[] => {
    if (!data || data.length === 0) return [];

    const result: InstallData[] = [];
    
    // Group data by time period
    const groupedByTime: Record<string, Record<string, number>> = {};
    
    data.forEach((item) => {
      const time = moment(item.date || item.createdAt).format('MMM DD');
      const sourceName = isAll ? 'All' : nameMap[item.source] || item.source || 'Unknown';
      
      if (!groupedByTime[time]) {
        groupedByTime[time] = {};
      }
      
      groupedByTime[time][sourceName] = item.value || 0;
    });

    // Convert to chart format
    Object.entries(groupedByTime).forEach(([time, sources]) => {
      Object.entries(sources).forEach(([sourceName, value]) => {
        result.push({
          month: time,
          region: sourceName,
          installs: Math.round(value),
        });
      });
    });

    return result;
  };
  // Get unique regions/sources for legend
  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    chartData.forEach(item => regions.add(item.region));
    return Array.from(regions);
  }, [chartData]);

  // Generate colors for regions
  const getRegionColor = (region: string, index: number) => {
    if (regionColors && regionColors[region]) {
      return regionColors[region];
    }
    // Default color palette
    const colors = ['#52c41a', '#faad14', '#1890ff', '#722ed1', '#fa8c16', '#13c2c2'];
    return colors[index % colors.length];
  };

  const columnConfig: ColumnConfig = {
    data: chartData,
    isStack: true,
    xField: 'month',
    yField: 'installs',
    seriesField: 'region',
    colorField: 'region',
    height: 300,
    color: uniqueRegions.map((region, index) => getRegionColor(region, index)),
    xAxis: {
      label: { 
        style: { 
          fill: '#8c8c8c', 
          fontSize: 12 
        } 
      },
      line: { 
        style: { 
          stroke: '#3a3a3e' 
        } 
      },
    },
    yAxis: {
      label: { 
        style: { 
          fill: '#8c8c8c', 
          fontSize: 11 
        } 
      },
      grid: { 
        line: { 
          style: { 
            stroke: '#3a3a3e', 
            lineDash: [4, 4], 
            opacity: 0.3 
          } 
        } 
      },
    },
    legend: false,
    tooltip: {
      shared: true,
      showMarkers: false,
    },
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
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
      <Row
        justify="space-between"
        align="top"
        style={{ marginBottom: '24px' }}
      >
        <Col>
          <Space direction="vertical" size={4}>
            <Typography.Title
              level={4}
              style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: 600 }}
            >
              {title}
            </Typography.Title>
            {subtitle && (
              <Typography.Text style={{ color: '#52c41a', fontSize: '14px', opacity: 0.8 }}>
                {subtitle}
              </Typography.Text>
            )}
          </Space>
        </Col>
        {currentYear && availableYears && onYearChange && (
          <Col>
            <Select
              value={currentYear}
              onChange={onYearChange}
              options={availableYears.map((y) => ({
                label: y.toString(),
                value: y,
              }))}
              style={{ width: 100 }}
            />
          </Col>
        )}
      </Row>
      
      {/* Dynamic Legend */}
      <Space size={24} style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
        {uniqueRegions.map((region, index) => (
          <Space key={region} size={8} align="center">
            <div 
              style={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: getRegionColor(region, index) 
              }} 
            />
            <Typography.Text style={{ color: '#d9d9d9', fontSize: 13 }}>
              {region}
            </Typography.Text>
          </Space>
        ))}
      </Space>
      
      {loading ? (
        <div style={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : chartData.length > 0 ? (
        <Column {...columnConfig} />
      ) : (
        <Empty 
          description="No data available" 
          style={{ height: 300 }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default AreaInstalledBarChartCard;

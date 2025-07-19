import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Typography, Space, Select, Row, Col, Spin, Empty } from 'antd';
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
import { LoadingOutlined } from '@ant-design/icons';
import { API, StatsType } from 'ssm-shared-lib';
import moment from 'moment';

// Static mapping outside component to avoid useCallback dependency issues
const STATS_TYPE_MAPPING: Record<string, StatsType.DeviceStatsType> = {
  cpu_usage: StatsType.DeviceStatsType.CPU,
  memory_usage: StatsType.DeviceStatsType.MEM_USED,
  memory_free: StatsType.DeviceStatsType.MEM_FREE,
  memory_available: StatsType.DeviceStatsType.MEM_AVAILABLE,
  memory_buffers: StatsType.DeviceStatsType.MEM_BUFFERS,
  memory_cached: StatsType.DeviceStatsType.MEM_CACHED,
  swap_free: StatsType.DeviceStatsType.SWAP_FREE,
  swap_used: StatsType.DeviceStatsType.SWAP_USED,
  load: StatsType.DeviceStatsType.LOAD,
  disk_used: StatsType.DeviceStatsType.DISK,
  storage_usage: StatsType.DeviceStatsType.DISK_USED,
  storage_free: StatsType.DeviceStatsType.DISK_FREE,
  containers: StatsType.DeviceStatsType.CONTAINERS,
};

interface InstallData {
  month: string; // Or other time unit
  region: string; // e.g. "Asia", "Europe"
  installs: number;
}

interface StackedBarChartProps {
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
  colorPalette?: string;
  customColors?: string[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({
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
  colorPalette,
  customColors,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiChartData, setApiChartData] = useState<InstallData[]>([]);
  const [deviceNameMap, setDeviceNameMap] = useState<Record<string, string>>({});
  const [containerNameMap, setContainerNameMap] = useState<Record<string, string>>({});
  const [rawApiData, setRawApiData] = useState<any[]>([]);

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


  // Determine if we're looking at all items or specific ones
  const { sourceArray, isAllSelected, sourceIds } = useMemo(() => {
    const array = Array.isArray(source) ? source : [source];
    const isAll = array.includes('all');
    const ids = isAll ? [] : array;
    return { sourceArray: array, isAllSelected: isAll, sourceIds: ids };
  }, [source]);

  // Fetch device/container names
  useEffect(() => {
    const fetchNames = async () => {
      if (dataType === 'device') {
        try {
          const response = await getAllDevices();
          const nameMap: Record<string, string> = {};
          response.data?.forEach((device) => {
            nameMap[device.uuid] = device.hostname || device.ip;
          });
          setDeviceNameMap(nameMap);
        } catch (error) {
          console.error('Failed to fetch device names:', error);
        }
      } else if (dataType === 'container') {
        try {
          const response = await getAllContainers();
          const nameMap: Record<string, string> = {};
          response.data?.forEach((container) => {
            nameMap[container.id] = container.name || container.id;
          });
          setContainerNameMap(nameMap);
        } catch (error) {
          console.error('Failed to fetch container names:', error);
        }
      }
    };

    fetchNames();
  }, [dataType]);

  // Transform API data to chart format
  const transformDataForStackedChart = useCallback((
    data: any[],
    isAll: boolean,
    nameMap: Record<string, string>
  ): InstallData[] => {
    if (!data || data.length === 0) return [];

    const result: InstallData[] = [];
    
    // Check if this is averaged data (items have 'name' and 'value' but no 'date')
    const isAveragedData = data.length > 0 && data[0].name && data[0].value !== undefined && !data[0].date;
    
    if (isAveragedData) {
      // Handle averaged stats format - group by device/source
      data.forEach((item) => {
        const sourceName = nameMap[item.name] || item.name || 'Unknown';
        const value = parseFloat(item.value) || 0;
        
        result.push({
          month: 'Average',
          region: sourceName,
          installs: Math.round(value),
        });
      });
    } else {
      // Group data by time period for time-series data
      const groupedByTime: Record<string, Record<string, number>> = {};
      
      data.forEach((item) => {
        // Handle null/undefined dates
        const dateValue = item.date || item.createdAt;
        if (!dateValue) {
          console.warn('Skipping item with no date:', item);
          return;
        }
        
        // Parse the custom date format: "2025-07-19-08:00:00"
        let parsedDate;
        if (typeof dateValue === 'string' && dateValue.includes('-') && dateValue.split('-').length > 3) {
          // Custom format: YYYY-MM-DD-HH:mm:ss
          const parts = dateValue.split('-');
          if (parts.length >= 4) {
            const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}`;
            parsedDate = moment(dateStr);
          }
        } else {
          // Try standard parsing
          parsedDate = moment(dateValue);
        }
        
        const time = parsedDate.format('MMM DD');
        // Skip if date is invalid
        if (!parsedDate.isValid() || time === 'Invalid date') {
          console.warn('Invalid date for item:', item);
          return;
        }
        
        const sourceName = isAll ? 'All' : nameMap[item.source] || item.source || 'Unknown';
        
        if (!groupedByTime[time]) {
          groupedByTime[time] = {};
        }
        
        // Ensure value is a number and not null
        const value = parseFloat(item.value) || 0;
        groupedByTime[time][sourceName] = value;
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
    }

    return result;
  }, []);

  // Fetch chart data
  const fetchData = useCallback(async () => {
    if (staticChartData || isPreview) return;
    
    setLoading(true);
    try {
        const dateRange = getDateRangeFromPreset(dateRangePreset, customDateRange);
        const [fromDate, toDate] = dateRange;
        
        let data: any[] = [];
        
        if (dataType === 'device') {
          const statsType = STATS_TYPE_MAPPING[metric] || StatsType.DeviceStatsType.CPU;
          
          if (isAllSelected) {
            // Fetch all device IDs first
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

        // Store raw API data for debugging
        setRawApiData(data);
        
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
  }, [
    staticChartData,
    isPreview,
    getDateRangeFromPreset,
    dateRangePreset,
    customDateRange,
    dataType,
    metric,
    isAllSelected,
    sourceIds,
  ]);

  // Effect to trigger data fetching
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update chart data when name maps change
  useEffect(() => {
    if (rawApiData.length > 0) {
      const transformedData = transformDataForStackedChart(
        rawApiData,
        isAllSelected,
        dataType === 'device' ? deviceNameMap : containerNameMap
      );
      setApiChartData(transformedData);
    }
  }, [rawApiData, deviceNameMap, containerNameMap, isAllSelected, dataType, transformDataForStackedChart]);

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
    if (customColors && customColors.length > 0) {
      return customColors[index % customColors.length];
    }
    // Default color palette
    const colors = ['#52c41a', '#faad14', '#1890ff', '#722ed1', '#fa8c16', '#13c2c2'];
    return colors[index % colors.length];
  };

  // Prepare data for ApexCharts
  const chartCategories = useMemo(() => {
    const months = new Set<string>();
    chartData.forEach(item => months.add(item.month));
    return Array.from(months).sort();
  }, [chartData]);

  const chartSeries = useMemo(() => {
    return uniqueRegions.map((region, index) => {
      const data = chartCategories.map(month => {
        const item = chartData.find(d => d.month === month && d.region === region);
        return item ? item.installs : 0;
      });
      
      return {
        name: region,
        data: data
      };
    });
  }, [chartData, uniqueRegions, chartCategories]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      stacked: true,
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
        borderRadius: 4,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
        columnWidth: '70%'
      }
    },
    colors: uniqueRegions.map((region, index) => getRegionColor(region, index)),
    xaxis: {
      categories: chartCategories,
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
      labels: {
        style: {
          colors: '#8c8c8c',
          fontSize: '11px'
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
    dataLabels: {
      enabled: false
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      style: {
        fontSize: '14px'
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const title = w.globals.labels[dataPointIndex];
        let tooltipHtml = `
          <div style="padding: 12px; background: #1a1a1a; border: 1px solid #3a3a3e; border-radius: 4px;">
            <div style="color: #d9d9d9; font-size: 14px; margin-bottom: 8px;">${title || 'No Date'}</div>`;
        
        series.forEach((s: number[], sIndex: number) => {
          const value = s[dataPointIndex];
          const seriesName = w.globals.seriesNames[sIndex];
          const color = w.globals.colors[sIndex];
          
          tooltipHtml += `
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%; margin-right: 8px;"></div>
              <span style="color: #8c8c8c; margin-right: 8px;">${seriesName}:</span>
              <span style="color: #d9d9d9;">${value != null ? value : 0}</span>
            </div>`;
        });
        
        tooltipHtml += '</div>';
        return tooltipHtml;
      }
    },
    fill: {
      opacity: 1
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.05
        }
      }
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
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={300}
        />
      ) : (
        <Empty 
          description="No data available" 
          style={{ height: 300 }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
      
      <DebugPanel 
        componentName="StackedBarChart"
        data={{
          rawApiData: rawApiData,
          transformedChartData: chartData,
          dataType,
          source,
          metric,
          dateRange: dateRangePreset
        }}
      />
      <DebugOverlay fileName="StackedBarChart.tsx" componentName="StackedBarChart" />
    </Card>
  );
};

export default StackedBarChart;
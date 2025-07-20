import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Statistic, Space } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { 
  getDashboardDevicesStats, 
  getDeviceStat,
  getDashboardAveragedDevicesStats
} from '@/services/rest/statistics/stastistics';
import { 
  getContainerStat,
  getContainerStats,
  getAveragedStats
} from '@/services/rest/containers/container-statistics';
import { entityCacheService } from '@/services/cache/entityCache.service';
import { API } from 'ssm-shared-lib';
import moment from 'moment';
import { useWidgetContext } from './DashboardLayoutEngine/WidgetContext';
import { useRegisterDebugData } from './DashboardLayoutEngine/DebugDataProvider';
import DemoOverlay from './DemoOverlay';

interface CompactStatCardProps {
  title: string;
  dataType?: 'device' | 'container';
  source?: string | string[];
  metric?: string;
  // Legacy props for backward compatibility
  value?: string;
  trendValue?: string;
  trendDirection?: 'up' | 'down';
  trendDescription?: string;
  trendColor?: string;
  cardStyle?: React.CSSProperties;
  isPreview?: boolean;
}

const CompactStatCard: React.FC<CompactStatCardProps> = ({
  title,
  dataType = 'device',
  source = 'all',
  metric = 'cpu_usage',
  // Legacy props for backward compatibility
  value: legacyValue,
  trendValue: legacyTrendValue,
  trendDirection: legacyTrendDirection,
  trendDescription: legacyTrendDescription,
  trendColor: legacyTrendColor,
  cardStyle,
  isPreview = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [chartData, setChartData] = useState<number[]>([]);
  const [apiTrendValue, setApiTrendValue] = useState<number>(0);
  const [apiTrendDirection, setApiTrendDirection] = useState<'up' | 'down'>('up');
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  
  // Get widget context and debug registration
  const widgetContext = useWidgetContext();
  const updateDebugData = useRegisterDebugData(widgetContext?.widgetId);

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

  useEffect(() => {
    const fetchData = async () => {
      // Use legacy props if provided (for backward compatibility)
      if (legacyValue) {
        setCurrentValue(parseFloat(legacyValue));
        setApiTrendValue(parseFloat(legacyTrendValue || '0'));
        setApiTrendDirection(legacyTrendDirection || 'up');
        // Generate mock chart data for legacy mode
        const mockData = Array.from({ length: 12 }, () => Math.random() * 100);
        setChartData(mockData);
        setIsUsingMockData(true);
        
        // Update debug data for legacy mode
        if (updateDebugData) {
          updateDebugData({
            componentName: 'CompactStatCard',
            fileName: 'CompactStatCard.tsx',
            rawApiData: {
              mode: 'legacy',
              legacyProps: {
                value: legacyValue,
                trendValue: legacyTrendValue,
                trendDirection: legacyTrendDirection,
                trendDescription: legacyTrendDescription,
                trendColor: legacyTrendColor
              },
              mockChartData: mockData
            } as Record<string, unknown>,
            processedData: {
              currentValue: parseFloat(legacyValue),
              trendValue: parseFloat(legacyTrendValue || '0'),
              trendDirection: legacyTrendDirection || 'up',
              chartData: mockData,
              isLegacyMode: true
            } as Record<string, unknown>,
            config: {
              mode: 'legacy',
              title,
              dataType: 'static',
              source: 'legacy-props'
            } as Record<string, unknown>
          });
        }
        return;
      }

      if (isPreview) {
        setCurrentValue(65.5);
        setApiTrendValue(12.4);
        const mockData = Array.from({ length: 12 }, (_, i) => 40 + Math.sin(i * 0.5) * 20);
        setChartData(mockData);
        setIsUsingMockData(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Reset mock data flag when fetching real data
        setIsUsingMockData(false);
        
        const now = moment();
        let currentVal = 0;
        const weekAgo = moment().subtract(7, 'days');
        const apiResponses: Record<string, unknown> = {};

        if (dataType === 'device' && metric) {
          if (isAllSelected) {
            // Get all device IDs from cache
            const devices = await entityCacheService.getDevices();
            apiResponses.devices = { data: devices };
            const allDeviceIds = devices.map(device => device.uuid);
            
            if (allDeviceIds.length === 0) {
              setCurrentValue(0);
              setChartData([]);
              return;
            }
            
            // Fetch current averaged stats
            const [currentStats, historicalStats] = await Promise.all([
              getDashboardAveragedDevicesStats(allDeviceIds, metric, {
                from: moment().subtract(1, 'hour').toDate(),
                to: moment().toDate(),
              }),
              getDashboardDevicesStats(allDeviceIds, metric, {
                from: weekAgo.toDate(),
                to: moment().toDate(),
              }),
            ]);
            
            apiResponses.currentStats = currentStats;
            apiResponses.historicalStats = historicalStats;
            
            console.log('📊 CompactStatCard API Response: getDashboardAveragedDevicesStats & getDashboardDevicesStats', { 
              component: 'CompactStatCard',
              title,
              currentStatsLength: currentStats.data?.length || 0,
              historicalStatsLength: historicalStats.data?.length || 0,
              currentData: currentStats.data,
              historicalData: historicalStats.data,
              usingFallback: !currentStats.data || currentStats.data.length === 0,
              timestamp: new Date().toISOString()
            });
            
            // Set current value (latest average)
            if (currentStats.data && currentStats.data.length > 0) {
              const avgValue = currentStats.data.reduce((sum, item) => sum + item.value, 0) / currentStats.data.length;
              currentVal = avgValue;
              setCurrentValue(avgValue);
            } else if (historicalStats.data && historicalStats.data.length > 0) {
              // Fallback: use latest values from historical data if current stats are empty
              const deviceLatestValues = new Map<string, number>();
              
              // Get the most recent value for each device
              historicalStats.data.forEach((stat: API.DeviceStat) => {
                const deviceId = stat.name;
                const existingValue = deviceLatestValues.get(deviceId);
                if (!existingValue || stat.date > (existingValue as any)?.date) {
                  deviceLatestValues.set(deviceId, stat.value);
                }
              });
              
              // Calculate average of latest values
              if (deviceLatestValues.size > 0) {
                const values = Array.from(deviceLatestValues.values());
                currentVal = values.reduce((sum, val) => sum + val, 0) / values.length;
                setCurrentValue(currentVal);
              }
            }
            
            console.log('📊 CompactStatCard FINAL VALUE CALCULATED:', { 
              component: 'CompactStatCard',
              title,
              currentVal,
              timestamp: new Date().toISOString()
            });
            
            // Process historical data for the bar chart
            if (historicalStats.data) {
              const processedData = processHistoricalDataForBars(historicalStats.data);
              setChartData(processedData);
              calculateTrend(processedData);
            }
          } else {
            // Fetch stats for specific devices
            if (sourceIds.length === 0) {
              setCurrentValue(0);
              setChartData([]);
              return;
            }
            
            const devicePromises = sourceIds.map(deviceId => 
              getDeviceStat(deviceId, metric)
            );
            const deviceStats = await Promise.all(devicePromises);
            apiResponses.deviceStats = deviceStats;
            
            // Calculate average of current values
            const validStats = deviceStats.filter(stat => stat.data);
            if (validStats.length > 0) {
              const avgValue = validStats.reduce((sum, stat) => sum + (stat.data?.value || 0), 0) / validStats.length;
              currentVal = avgValue;
              setCurrentValue(avgValue);
            }
            
            // Fetch historical data
            const historicalStats = await getDashboardDevicesStats(sourceIds, metric, {
              from: weekAgo.toDate(),
              to: moment().toDate(),
            });
            apiResponses.historicalStats = historicalStats;
            
            if (historicalStats.data) {
              const processedData = processHistoricalDataForBars(historicalStats.data);
              setChartData(processedData);
              calculateTrend(processedData);
            }
          }
        } else if (dataType === 'container' && metric) {
          // Container implementation (simplified)
          const avgStats = await getAveragedStats();
          apiResponses.avgStats = avgStats;
          
          if (metric === 'container_cpu_usage' && avgStats.data?.cpuStats) {
            setCurrentValue(avgStats.data.cpuStats);
          } else if (metric === 'container_memory_usage' && avgStats.data?.memStats) {
            setCurrentValue(avgStats.data.memStats);
          }
          
          // Generate mock chart data for containers (can be enhanced later)
          const mockData = Array.from({ length: 12 }, () => Math.random() * 100);
          setChartData(mockData);
          calculateTrend(mockData);
          setIsUsingMockData(true);
        }

        // Update debug data
        if (updateDebugData) {
          updateDebugData({
            componentName: 'CompactStatCard',
            fileName: 'CompactStatCard.tsx',
            rawApiData: {
              apiCalls: {
                source,
                isAllSelected,
                sourceIds,
                metric,
                dataType
              },
              responses: apiResponses
            } as Record<string, unknown>,
            processedData: {
              currentValue: currentVal,
              chartData,
              trendValue: apiTrendValue,
              trendDirection: apiTrendDirection
            } as Record<string, unknown>,
            config: {
              dataType,
              source,
              metric
            } as Record<string, unknown>
          });
        }
      } catch (error) {
        console.error('Failed to fetch compact stat data:', error);
        setCurrentValue(0);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType, source, metric, isAllSelected, sourceIds.join(','), isPreview, legacyValue]);

  const processHistoricalDataForBars = (data: API.DeviceStat[]) => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Group data by hour and get 12 recent hourly averages
    const grouped = data.reduce((acc: Record<string, number[]>, item) => {
      const hour = moment(item.date).format('YYYY-MM-DD-HH');
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(item.value);
      return acc;
    }, {});

    // Calculate averages for each hour and take last 12 hours
    const processed = Object.keys(grouped)
      .sort()
      .slice(-12) // Take last 12 hours
      .map(hour => {
        const values = grouped[hour];
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      });
      
    // Ensure we have exactly 12 data points
    while (processed.length < 12) {
      processed.unshift(processed[0] || 0);
    }
    
    return processed.slice(-12);
  };

  const calculateTrend = (data: number[]) => {
    console.log('📊 CompactStatCard calculateTrend input:', { data, dataType: typeof data[0] });
    if (data.length < 2) return;
    
    // Compare first half with second half
    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    console.log('📊 CompactStatCard calculateTrend result:', { 
      firstAvg, secondAvg, percentChange, 
      trendValue: Math.abs(percentChange), 
      direction: percentChange >= 0 ? 'up' : 'down' 
    });
    setApiTrendValue(Math.abs(percentChange));
    setApiTrendDirection(percentChange >= 0 ? 'up' : 'down');
  };

  // Use API data or fall back to legacy props
  const displayValue = legacyValue ? parseFloat(legacyValue) : currentValue;
  const displayTrendValue = legacyTrendValue ? parseFloat(legacyTrendValue) : apiTrendValue;
  const displayTrendDirection = legacyTrendDirection || apiTrendDirection;
  const displayTrendDescription = legacyTrendDescription || 'last week';
  const displayTrendColor = legacyTrendColor || (displayTrendDirection === 'up' ? '#52c41a' : '#ff4d4f');

  const formatValue = (value: number) => {
    if (metric === 'containers') {
      return Math.round(value).toLocaleString();
    }
    return `${value.toFixed(1)}%`;
  };

  const trendIcon = displayTrendDirection === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

  // Bar chart options for mini vertical bars
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 40,
      width: 60,
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: [displayTrendColor],
    stroke: {
      width: 0
    },
    fill: {
      opacity: 0.8
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const dataPoint = chartData[dataPointIndex];
        const timestamp = dataPoint ? new Date(Date.now() - (chartData.length - dataPointIndex - 1) * 3600000).toLocaleString() : 'Unknown';
        
        return `
          <div style="padding: 8px 12px; background: rgba(0,0,0,0.75); color: white; box-shadow: 0px 0px 10px rgba(0,0,0,0.5); border-radius: 4px;">
            <div>${value.toFixed(1)}%</div>
            <div style="color: #8c8c8c; font-size: 11px; margin-top: 2px;">${timestamp}</div>
            <div style="color: #8c8c8c; font-size: 10px; margin-top: 1px;">Raw: ${dataPoint || 'N/A'}</div>
          </div>`;
      }
    },
    yaxis: {
      show: false
    },
    xaxis: {
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
    }
  };

  const chartSeries = [{
    name: title,
    data: chartData
  }];

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        position: 'relative',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '20px 24px' }}
      loading={loading}
    >
      <DemoOverlay show={isUsingMockData} />
    
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
          {title}
        </Typography.Text>
        <Space
          align="center"
          style={{ justifyContent: 'space-between', width: '100%' }}
          size={12}
        >
          <Typography.Title
            level={2}
            style={{
              color: '#f0f0f0',
              margin: 0,
              fontSize: '30px',
              fontWeight: '600',
            }}
          >
            {formatValue(displayValue)}
          </Typography.Title>
          <div style={{ 
            width: '60px', 
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chartData.length === 0 ? '#2a2a2a' : 'transparent',
            borderRadius: '4px'
          }}>
            {chartData.length > 0 ? (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={40}
                width={60}
              />
            ) : (
              <div style={{ color: '#8c8c8c', fontSize: '10px' }}>
                No data
              </div>
            )}
          </div>
        </Space>
        <Space align="center" size={4}>
          <Statistic
            value={displayTrendValue}
            precision={1}
            valueStyle={{
              color: displayTrendColor,
              fontSize: '13px',
              fontWeight: 500,
            }}
            prefix={trendIcon}
            suffix="%"
          />
          <Typography.Text
            style={{ color: '#8c8c8c', fontSize: '13px', marginLeft: '4px' }}
          >
            {displayTrendDescription}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  );
};

export default CompactStatCard;

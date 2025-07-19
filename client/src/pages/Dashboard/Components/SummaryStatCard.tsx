import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import DebugPanel from './DebugPanel';
import { 
  getDashboardDevicesStats, 
  getDeviceStat,
  getDashboardAveragedDevicesStats,
  getDashboardSystemPerformance
} from '@/services/rest/statistics/stastistics';
import { 
  getContainerStat,
  getContainerStats,
  getAveragedStats
} from '@/services/rest/containers/container-statistics';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getContainers as getAllContainers } from '@/services/rest/containers/containers';
import { API } from 'ssm-shared-lib';
import moment from 'moment';

interface SummaryStatCardProps {
  title: string;
  dataType?: 'device' | 'container';
  source?: string | string[];
  metric?: string;
  icon?: React.ReactNode;
  illustrationUrl?: string;
  cardStyle?: React.CSSProperties;
  defaultValue?: string;
  defaultTrend?: string;
  isPreview?: boolean;
}

const SummaryStatCard: React.FC<SummaryStatCardProps> = ({
  title,
  dataType = 'device',
  source = 'all',
  metric = 'cpu_usage',
  icon,
  illustrationUrl,
  cardStyle,
  defaultValue = '0',
  defaultTrend = '0',
  isPreview = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [trendValue, setTrendValue] = useState<number>(0);
  const [trendDirection, setTrendDirection] = useState<'up' | 'down'>('up');
  const [rawApiData, setRawApiData] = useState<any>({});

  // Determine if we're looking at all items or specific ones
  const isAllSelected = Array.isArray(source) ? source.includes('all') : source === 'all';
  const sourceIds = Array.isArray(source) ? source.filter(s => s !== 'all') : [source];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use mock data in preview mode
        if (isPreview) {
          setCurrentValue(65.5);
          setTrendValue(12.4);
          const mockSparklineData = Array.from({ length: 7 }, (_, i) => ({
            value: Math.floor(Math.random() * 30) + 50,
            index: i,
          }));
          setWeeklyData(mockSparklineData);
          setLoading(false);
          return;
        }
        const now = moment();
        const weekAgo = moment().subtract(7, 'days');
        
        if (dataType === 'device' && metric) {
          if (isAllSelected) {
            // Fetch all device IDs first
            const devicesResponse = await getAllDevices();
            const allDeviceIds = devicesResponse.data?.map(device => device.uuid) || [];
            
            if (allDeviceIds.length === 0) {
              // No devices available
              setCurrentValue(0);
              setWeeklyData([]);
              return;
            }
            
            // Fetch averaged stats for all devices
            const [currentStats, historicalStats] = await Promise.all([
              getDashboardAveragedDevicesStats(allDeviceIds, metric, {
                from: now.subtract(1, 'hour').toDate(),
                to: now.toDate(),
              }),
              getDashboardDevicesStats(allDeviceIds, metric, {
                from: weekAgo.toDate(),
                to: now.toDate(),
              }),
            ]);
            
            // Store raw API data for debugging
            setRawApiData({
              currentStats: currentStats.data,
              historicalStats: historicalStats.data,
              metric,
              dataType,
              source: 'all'
            });
            
            // Set current value (latest average)
            if (currentStats.data && currentStats.data.length > 0) {
              const avgValue = currentStats.data.reduce((sum, item) => sum + item.value, 0) / currentStats.data.length;
              setCurrentValue(avgValue); // Already in percentage (0-100)
            }
            
            // Process historical data for the sparkline
            if (historicalStats.data) {
              const processedData = processHistoricalData(historicalStats.data);
              setWeeklyData(processedData);
              calculateTrend(processedData);
            }
          } else {
            // Fetch stats for specific devices
            const devicePromises = sourceIds.map(deviceId => 
              getDeviceStat(deviceId, metric)
            );
            const deviceStats = await Promise.all(devicePromises);
            
            // Calculate average of current values
            const validStats = deviceStats.filter(stat => stat.data);
            if (validStats.length > 0) {
              const avgValue = validStats.reduce((sum, stat) => sum + (stat.data?.value || 0), 0) / validStats.length;
              setCurrentValue(avgValue); // Value is already in percentage (0-100)
            }
            
            // Fetch historical data
            const historicalStats = await getDashboardDevicesStats(sourceIds, metric, {
              from: weekAgo.toDate(),
              to: now.toDate(),
            });
            
            if (historicalStats.data) {
              const processedData = processHistoricalData(historicalStats.data);
              setWeeklyData(processedData);
              calculateTrend(processedData);
            }
          }
        } else if (dataType === 'container' && metric) {
          if (isAllSelected) {
            // Fetch averaged stats for all containers
            const avgStats = await getAveragedStats();
            
            if (metric === 'container_cpu_usage' && avgStats.data?.cpuStats) {
              setCurrentValue(avgStats.data.cpuStats); // Already in percentage
            } else if (metric === 'container_memory_usage' && avgStats.data?.memStats) {
              setCurrentValue(avgStats.data.memStats); // Already in percentage
            }
            
            // Fetch all containers for historical data
            const containersResponse = await getAllContainers();
            const allContainerIds = containersResponse.data?.map(container => container.id) || [];
            
            if (allContainerIds.length > 0 && metric) {
              // Fetch historical data for sparkline
              const historicalPromises = allContainerIds.slice(0, 10).map(containerId => 
                getContainerStats(containerId, metric, {
                  from: weekAgo.toDate(),
                  to: now.toDate(),
                })
              );
              
              try {
                const historicalResults = await Promise.all(historicalPromises);
                // Combine and process historical data
                const combinedData: any[] = [];
                historicalResults.forEach(result => {
                  if (result.data) {
                    combinedData.push(...result.data);
                  }
                });
                
                if (combinedData.length > 0) {
                  const processedData = processHistoricalData(combinedData);
                  setWeeklyData(processedData);
                  calculateTrend(processedData);
                } else {
                  // Use mock data if no historical data
                  const mockData = generateMockSparklineData();
                  setWeeklyData(mockData);
                  calculateTrend(mockData);
                }
              } catch (error) {
                console.error('Failed to fetch container historical data:', error);
                const mockData = generateMockSparklineData();
                setWeeklyData(mockData);
                calculateTrend(mockData);
              }
            } else {
              // Use mock data for sparkline
              const mockData = generateMockSparklineData();
              setWeeklyData(mockData);
              calculateTrend(mockData);
            }
          } else {
            // Fetch stats for specific containers
            const containerPromises = sourceIds.map(containerId => 
              getContainerStat(containerId, metric)
            );
            const containerStats = await Promise.all(containerPromises);
            
            // Calculate average of current values
            const validStats = containerStats.filter(stat => stat.data);
            if (validStats.length > 0) {
              const avgValue = validStats.reduce((sum, stat) => sum + (stat.data?.value || 0), 0) / validStats.length;
              setCurrentValue(avgValue); // Value is already in percentage (0-100)
            }
          }
          
          // For now, use mock data for container sparklines
          // TODO: Implement historical container stats when available
          const mockData = generateMockSparklineData();
          setWeeklyData(mockData);
          calculateTrend(mockData);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Use default values on error
        setCurrentValue(parseFloat(defaultValue));
        setTrendValue(parseFloat(defaultTrend));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [dataType, source, metric, isPreview, defaultValue, defaultTrend]);

  const processHistoricalData = (data: API.DeviceStat[]) => {
    // Group data by time intervals (hourly)
    const grouped = data.reduce((acc: any, item) => {
      const hour = moment(item.date).format('YYYY-MM-DD-HH');
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(item.value);
      return acc;
    }, {});

    // Calculate averages for each hour
    return Object.keys(grouped)
      .sort()
      .map((hour, index) => ({
        index,
        value: grouped[hour].reduce((sum: number, val: number) => sum + val, 0) / grouped[hour].length
      }));
  };

  const calculateTrend = (data: any[]) => {
    if (data.length < 2) return;
    
    // Compare last week's average with this week's average
    const midPoint = Math.floor(data.length / 2);
    const lastWeekData = data.slice(0, midPoint);
    const thisWeekData = data.slice(midPoint);
    
    const lastWeekAvg = lastWeekData.reduce((sum, item) => sum + item.value, 0) / lastWeekData.length;
    const thisWeekAvg = thisWeekData.reduce((sum, item) => sum + item.value, 0) / thisWeekData.length;
    
    const percentChange = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
    setTrendValue(Math.abs(percentChange));
    setTrendDirection(percentChange >= 0 ? 'up' : 'down');
  };

  const generateMockSparklineData = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const progress = i / 29;
      const wave1 = Math.sin(progress * Math.PI * 3) * 15;
      const wave2 = Math.sin(progress * Math.PI * 5) * 5;
      const trendLine = trendDirection === 'down' ? progress * -10 : progress * 10;
      return {
        index: i,
        value: 50 + wave1 + wave2 + trendLine
      };
    });
  };

  const formatValue = (value: number) => {
    // Format based on metric type
    if (metric === 'containers') {
      return Math.round(value).toLocaleString();
    }
    // For percentages, show one decimal place with % symbol
    return `${value.toFixed(1)}%`;
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
      colors: ['#faad14'] // Golden color as shown in the image
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      enabled: false
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
    data: weeklyData.map(item => item.value)
  }];

  const trendIcon = trendDirection === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendColor = trendDirection === 'up' ? '#52c41a' : '#ff4d4f';

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        minWidth: '320px',
        border: 'none',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px' }}
      loading={loading}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Typography.Text style={{ color: '#b8bac3', fontSize: '14px', fontWeight: 400 }}>
          {title}
        </Typography.Text>
        
        <Space
          align="end"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Space direction="vertical" size={8}>
            <Typography.Title
              level={2}
              style={{
                color: '#ffffff',
                margin: 0,
                fontSize: '36px',
                fontWeight: '500',
                lineHeight: 1,
              }}
            >
              {formatValue(currentValue)}
            </Typography.Title>
            <Space align="center" size={6}>
              {trendIcon}
              <Typography.Text
                style={{ 
                  color: trendColor, 
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {trendValue.toFixed(1)}%
              </Typography.Text>
              <Typography.Text
                style={{ color: '#7a7d87', fontSize: '14px' }}
              >
                last week
              </Typography.Text>
            </Space>
          </Space>
          
          <div style={{ 
            width: '100px', 
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {weeklyData.length > 0 && (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="line"
                height={50}
                width={100}
              />
            )}
          </div>
        </Space>
      </Space>
      
      <DebugPanel 
        componentName="SummaryStatCard"
        data={{
          rawApiData,
          processedData: {
            currentValue,
            weeklyData,
            trendValue,
            trendDirection
          },
          config: {
            dataType,
            source,
            metric
          }
        }}
        maxHeight={200}
      />
    </Card>
  );
};

export default SummaryStatCard;
import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Space, Progress } from 'antd';
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
import { API, StatsType } from 'ssm-shared-lib';
import moment from 'moment';
import { getPaletteColors, getSemanticColors } from './utils/colorPalettes';

interface CircularProgressChartProps {
  title: string;
  dataType?: 'device' | 'container';
  source?: string | string[];
  metric?: string;
  icon?: React.ReactNode;
  illustrationUrl?: string;
  defaultValue?: string;
  defaultTrend?: string;
  isPreview?: boolean;
  customColors?: string[];
  colorPalette?: string;
  backgroundColorPalette?: string;
  cardStyle?: React.CSSProperties;
}

// Static mapping for metric types
const STATS_TYPE_MAPPING: Record<string, StatsType.DeviceStatsType> = {
  cpu_usage: StatsType.DeviceStatsType.CPU,
  memory_usage: StatsType.DeviceStatsType.MEM_USED,
  memory_free: StatsType.DeviceStatsType.MEM_FREE,
  storage_usage: StatsType.DeviceStatsType.DISK_USED,
  storage_free: StatsType.DeviceStatsType.DISK_FREE,
  containers: StatsType.DeviceStatsType.CONTAINERS,
};

const CircularProgressChart: React.FC<CircularProgressChartProps> = ({
  title,
  dataType = 'device',
  source = 'all',
  metric = 'cpu_usage',
  icon,
  illustrationUrl,
  defaultValue = '0',
  defaultTrend = '0',
  isPreview = false,
  customColors = [],
  colorPalette = 'default',
  backgroundColorPalette = 'default',
  cardStyle,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>('0');

  // Determine if we're looking at all items or specific ones (memoized to prevent infinite loops)
  const { isAllSelected, sourceIds } = useMemo(() => {
    console.log('📊 CircularProgressChart source prop:', { 
      component: 'CircularProgressChart',
      title,
      source,
      sourceType: Array.isArray(source) ? 'array' : typeof source,
      sourceValue: source,
      timestamp: new Date().toISOString()
    });
    
    // Handle empty array as 'all'
    const isAll = Array.isArray(source) ? (source.length === 0 || source.includes('all')) : source === 'all';
    let ids: string[] = [];
    
    if (Array.isArray(source)) {
      ids = source.filter(s => s && s !== 'all');
    } else if (source && source !== 'all') {
      ids = [source];
    }
    
    console.log('📊 CircularProgressChart parsed source:', { 
      component: 'CircularProgressChart',
      title,
      isAllSelected: isAll,
      sourceIds: ids,
      sourceIdsLength: ids.length,
      timestamp: new Date().toISOString()
    });
    
    return { isAllSelected: isAll, sourceIds: ids };
  }, [source, title]);

  // Get semantic colors from palette
  const semanticColors = useMemo(() => {
    return getSemanticColors(colorPalette);
  }, [colorPalette]);

  // Get palette colors for chart
  const paletteColors = useMemo(() => {
    return customColors && customColors.length > 0 ? customColors : getPaletteColors(colorPalette);
  }, [colorPalette, customColors]);

  // Progress color - use primary color from semantic palette
  const getProgressColor = useMemo(() => {
    if (customColors && customColors.length > 0) {
      return customColors[0];
    }
    return semanticColors.primary;
  }, [customColors, semanticColors]);

  // Background color palette logic
  const getBackgroundColor = useMemo(() => {
    const backgroundPalettes = {
      default: '#4a8b6f',    // Default green
      primary: '#2980b9',    // Primary blue
      success: '#009432',    // Success green
      warning: '#e67e22',    // Warning orange
      error: '#e74c3c',      // Error red
      light: '#95a5a6',      // Light gray
      dark: '#1a1a1a',       // Dark theme
      purple: '#8e44ad',     // Purple gradient
      ocean: '#3498db',      // Ocean blue
      sunset: '#e67e22',     // Sunset orange
    };
    
    return backgroundPalettes[backgroundColorPalette] || backgroundPalettes.default;
  }, [backgroundColorPalette]);


  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      console.log('📊 CircularProgressChart fetchData called:', { 
        component: 'CircularProgressChart',
        title,
        dataType,
        metric,
        isAllSelected,
        sourceIds,
        sourceIdsLength: sourceIds.length,
        isPreview,
        timestamp: new Date().toISOString()
      });
      
      setLoading(true);
      try {
        // Use mock data in preview mode
        if (isPreview) {
          setCurrentValue(65.5);
          setDisplayValue('65.5%');
          setLoading(false);
          return;
        }

        const now = moment();
        
        if (dataType === 'device' && metric) {
          console.log('📊 CircularProgressChart entering device data fetch:', { 
            component: 'CircularProgressChart',
            title,
            isAllSelected,
            sourceIds,
            timestamp: new Date().toISOString()
          });
          
          if (isAllSelected) {
            // Fetch all device IDs first
            console.log('📊 CircularProgressChart API Call: getAllDevices', { 
              component: 'CircularProgressChart',
              title,
              timestamp: new Date().toISOString()
            });
            const devicesResponse = await getAllDevices();
            const allDeviceIds = devicesResponse.data?.map(device => device.uuid) || [];
            console.log('📊 CircularProgressChart API Response: getAllDevices', { 
              component: 'CircularProgressChart',
              title,
              deviceCount: allDeviceIds.length,
              deviceIds: allDeviceIds,
              timestamp: new Date().toISOString()
            });
            
            if (allDeviceIds.length === 0) {
              setCurrentValue(0);
              setDisplayValue(defaultValue);
              return;
            }
            
            const statsType = STATS_TYPE_MAPPING[metric] || StatsType.DeviceStatsType.CPU;
            
            // Fetch current averaged stats
            const fromDate = moment().subtract(1, 'hour').toDate();
            const toDate = moment().toDate();
            console.log('📊 CircularProgressChart API Call: getDashboardAveragedDevicesStats', { 
              component: 'CircularProgressChart',
              title,
              deviceIds: allDeviceIds,
              statsType,
              metric,
              dateRange: {
                from: fromDate,
                to: toDate
              },
              timestamp: new Date().toISOString()
            });
            const currentStats = await getDashboardAveragedDevicesStats(allDeviceIds, statsType, {
              from: fromDate,
              to: toDate,
            });
            console.log('📊 CircularProgressChart API Response: getDashboardAveragedDevicesStats', { 
              component: 'CircularProgressChart',
              title,
              dataLength: currentStats.data?.length || 0,
              rawData: currentStats.data,
              timestamp: new Date().toISOString()
            });
            
            if (currentStats.data && currentStats.data.length > 0) {
              // Calculate average value like MetricCardWithMiniLineChart does
              const avgValue = currentStats.data.reduce((sum, item) => sum + item.value, 0) / currentStats.data.length;
              const val = avgValue;
              setCurrentValue(val);
              
              // Format display value based on metric type
              if (metric.includes('containers')) {
                setDisplayValue(Math.round(val).toLocaleString());
              } else {
                setDisplayValue(`${val.toFixed(1)}%`);
              }
            }
          } else {
            // Handle specific device selection - using same approach as MetricCardWithMiniLineChart
            if (sourceIds.length === 0) {
              setCurrentValue(0);
              setDisplayValue(defaultValue);
              return;
            }
            
            // Fetch current stats for each device individually
            console.log('📊 CircularProgressChart API Call: getDeviceStat (specific devices)', { 
              component: 'CircularProgressChart',
              title,
              deviceIds: sourceIds,
              metric,
              timestamp: new Date().toISOString()
            });
            
            const devicePromises = sourceIds.map(deviceId => 
              getDeviceStat(deviceId, metric)
            );
            const deviceStats = await Promise.all(devicePromises);
            
            console.log('📊 CircularProgressChart API Response: getDeviceStat (multiple)', { 
              component: 'CircularProgressChart',
              title,
              deviceIds: sourceIds,
              deviceStats: deviceStats.map(stat => ({ deviceId: stat.data?.name, value: stat.data?.value })),
              timestamp: new Date().toISOString()
            });
            
            // Calculate average of current values
            const validStats = deviceStats.filter(stat => stat.data);
            if (validStats.length > 0) {
              const avgValue = validStats.reduce((sum, stat) => sum + (stat.data?.value || 0), 0) / validStats.length;
              console.log('📊 CircularProgressChart setting value (specific devices):', { 
                component: 'CircularProgressChart',
                title,
                avgValue,
                metric,
                validStats: validStats.length,
                timestamp: new Date().toISOString()
              });
              setCurrentValue(avgValue);
              
              // Format display value based on metric type
              if (metric.includes('containers')) {
                setDisplayValue(Math.round(avgValue).toLocaleString());
              } else {
                setDisplayValue(`${avgValue.toFixed(1)}%`);
              }
            } else {
              console.log('📊 CircularProgressChart NO DATA for specific devices:', { 
                component: 'CircularProgressChart',
                title,
                deviceStats,
                timestamp: new Date().toISOString()
              });
              setCurrentValue(0);
              setDisplayValue(defaultValue);
            }
          }
        } else if (dataType === 'container') {
          // Container logic can be implemented similarly
          setCurrentValue(0);
          setDisplayValue(defaultValue);
        }
      } catch (error) {
        console.error('Failed to fetch circular progress data:', error);
        setCurrentValue(0);
        setDisplayValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up auto-refresh every 30 seconds (like MetricCardWithMiniLineChart)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [dataType, metric, isAllSelected, sourceIds.join(','), isPreview, title, defaultValue]);

  const getMetricLabel = (metric: string): string => {
    const labels: Record<string, string> = {
      cpu_usage: 'CPU Usage',
      memory_usage: 'Memory Usage', 
      memory_free: 'Memory Free',
      storage_usage: 'Storage Usage',
      storage_free: 'Storage Free',
      containers: 'Containers',
    };
    return labels[metric] || metric;
  };

  return (
    <Card
      style={{
        backgroundColor: getBackgroundColor,
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px 28px' }}
      loading={loading}
    >
      {/* Background illustration or decorative circles */}
      {illustrationUrl ? (
        <div style={{
          position: 'absolute',
          right: -20,
          top: -20,
          width: 140,
          height: 140,
          backgroundImage: `url(${illustrationUrl})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.15,
        }} />
      ) : (
        <>
          <div style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }} />
          <div style={{
            position: 'absolute',
            right: 40,
            bottom: -40,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }} />
        </>
      )}
      
      <Space direction="horizontal" align="center" size={20} style={{ position: 'relative' }}>
        <Progress
          type="circle"
          percent={currentValue || 0}
          width={90}
          strokeWidth={10}
          format={() => (
            <Typography.Text
              style={{ color: '#ffffff', fontSize: '20px', fontWeight: '600' }}
            >
              {Math.round(currentValue || 0)}%
            </Typography.Text>
          )}
          strokeColor={getProgressColor}
          trailColor="rgba(255, 255, 255, 0.2)"
          strokeLinecap="round"
        />
        <Space direction="vertical" align="start" size={4}>
          <Typography.Title
            level={4}
            style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              lineHeight: 1,
            }}
          >
            {title}
          </Typography.Title>
          {icon && (
            <div style={{ 
              fontSize: '24px', 
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center'
            }}>
              {icon}
            </div>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default CircularProgressChart;

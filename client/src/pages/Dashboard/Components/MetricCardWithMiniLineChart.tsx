import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { WIDGET_TYPOGRAPHY, WIDGET_CARD, WIDGET_COLORS } from '../constants/widgetStyles';
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
import { entityCacheService } from '@/services/cache/entityCache.service';
import { API } from 'ssm-shared-lib';
import moment from 'moment';
import { useWidgetContext } from './DashboardLayoutEngine/WidgetContext';
import { useRegisterDebugData } from './DashboardLayoutEngine/DebugDataProvider';
import DemoOverlay from './DemoOverlay';

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
          setIsUsingMockData(true);
          setLoading(false);
          
          // Update debug data for preview mode
          if (updateDebugData) {
            updateDebugData({
              componentName: 'SummaryStatCard',
              fileName: 'SummaryStatCard.tsx',
              rawApiData: {
                apiCalls: {
                  mode: 'preview',
                  mockData: true
                },
                responses: {
                  mockData: mockSparklineData
                }
              } as Record<string, unknown>,
              processedData: {
                currentValue: 65.5,
                trendValue: 12.4,
                weeklyData: mockSparklineData
              } as Record<string, unknown>,
              config: {
                dataType,
                source,
                metric,
                isPreview: true
              } as Record<string, unknown>
            });
          }
          return;
        }
        const now = moment();
        const weekAgo = moment().subtract(7, 'days');
        
        // Reset mock data flag when fetching real data
        setIsUsingMockData(false);
        
        if (dataType === 'device' && metric) {
          if (isAllSelected) {
            // Get all device IDs from cache
            console.log('📊 SummaryStatCard: Getting all devices', { 
              component: 'SummaryStatCard',
              title,
              timestamp: new Date().toISOString()
            });
            const devices = await entityCacheService.getDevices();
            const allDeviceIds = devices.map(device => device.uuid);
            console.log('📊 SummaryStatCard API Response: getAllDevices', { 
              component: 'SummaryStatCard',
              title,
              deviceCount: allDeviceIds.length,
              deviceIds: allDeviceIds,
              timestamp: new Date().toISOString()
            });
            
            if (allDeviceIds.length === 0) {
              // No devices available
              setCurrentValue(0);
              setWeeklyData([]);
              return;
            }
            
            // Fetch averaged stats for all devices
            console.log('📊 SummaryStatCard API Call: getDashboardAveragedDevicesStats & getDashboardDevicesStats', { 
              component: 'SummaryStatCard',
              title,
              deviceIds: allDeviceIds,
              metric,
              currentRange: {
                from: moment().subtract(1, 'hour').toDate(),
                to: moment().toDate()
              },
              historicalRange: {
                from: weekAgo.toDate(),
                to: moment().toDate()
              },
              timestamp: new Date().toISOString()
            });
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
            
            console.log('📊 SummaryStatCard API Response: getDashboardAveragedDevicesStats & getDashboardDevicesStats', { 
              component: 'SummaryStatCard',
              title,
              currentStatsLength: currentStats.data?.length || 0,
              historicalStatsLength: historicalStats.data?.length || 0,
              currentData: currentStats.data,
              historicalData: historicalStats.data,
              usingFallback: !currentStats.data || currentStats.data.length === 0,
              timestamp: new Date().toISOString()
            });
            
            // Store raw API data for debugging
            const apiDebugData = {
              currentStats: currentStats.data,
              historicalStats: historicalStats.data,
              metric,
              dataType,
              source: 'all'
            };
            setRawApiData(apiDebugData);
            
            // Set current value (latest average)
            let finalCurrentValue = 0;
            if (currentStats.data && currentStats.data.length > 0) {
              const avgValue = currentStats.data.reduce((sum, item) => sum + item.value, 0) / currentStats.data.length;
              setCurrentValue(avgValue); // Already in percentage (0-100)
              finalCurrentValue = avgValue;
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
                finalCurrentValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                setCurrentValue(finalCurrentValue);
              }
            }
            
            console.log('📊 SummaryStatCard FINAL VALUE CALCULATED:', { 
              component: 'SummaryStatCard',
              title,
              finalCurrentValue,
              timestamp: new Date().toISOString()
            });
            
            // Process historical data for the sparkline
            let processedData: any[] = [];
            if (historicalStats.data) {
              processedData = processHistoricalData(historicalStats.data);
              console.log('📊 SummaryStatCard: Processed sparkline data', {
                component: 'SummaryStatCard',
                title,
                rawDataLength: historicalStats.data.length,
                processedDataLength: processedData.length,
                processedData: processedData
              });
              setWeeklyData(processedData);
              calculateTrend(processedData);
            }
            
            // Update debug data
            if (updateDebugData) {
              updateDebugData({
                componentName: 'SummaryStatCard',
                fileName: 'SummaryStatCard.tsx',
                rawApiData: {
                  apiCalls: {
                    source: 'all',
                    isAllSelected: true,
                    sourceIds: [],
                    getAllDevices: {
                      method: 'GET',
                      endpoint: '/api/devices',
                      description: 'Get all devices from cache'
                    },
                    getDashboardAveragedDevicesStats: {
                      method: 'POST',
                      endpoint: `/api/statistics/dashboard/averaged/${metric}`,
                      params: {
                        from: moment().subtract(1, 'hour').toDate(),
                        to: moment().toDate()
                      },
                      body: {
                        devices: allDeviceIds
                      }
                    },
                    getDashboardDevicesStats: {
                      method: 'POST',
                      endpoint: `/api/statistics/dashboard/stats/${metric}`,
                      params: {
                        from: weekAgo.toDate(),
                        to: moment().toDate()
                      },
                      body: {
                        devices: allDeviceIds
                      }
                    }
                  },
                  responses: {
                    devices: { data: devices },
                    currentStats: currentStats,
                    historicalStats: historicalStats
                  }
                } as Record<string, unknown>,
                processedData: {
                  currentValue: finalCurrentValue,
                  weeklyData: processedData,
                  deviceCount: allDeviceIds.length,
                  dateRange: {
                    from: weekAgo.toISOString(),
                    to: moment().toISOString()
                  }
                } as Record<string, unknown>,
                config: {
                  dataType,
                  source,
                  metric,
                  isAllSelected: true
                } as Record<string, unknown>
              });
            }
          } else {
            // Fetch stats for specific devices
            if (sourceIds.length === 0) {
              // No specific devices selected
              setCurrentValue(0);
              setWeeklyData([]);
              return;
            }
            
            console.log('📊 SummaryStatCard API Call: getDeviceStat (multiple)', { 
              component: 'SummaryStatCard',
              title,
              deviceIds: sourceIds,
              metric,
              timestamp: new Date().toISOString()
            });
            const devicePromises = sourceIds.map(deviceId => 
              getDeviceStat(deviceId, metric)
            );
            const deviceStats = await Promise.all(devicePromises);
            console.log('📊 SummaryStatCard API Response: getDeviceStat (multiple)', { 
              component: 'SummaryStatCard',
              title,
              deviceIds: sourceIds,
              deviceStats: deviceStats.map(stat => ({ deviceId: stat.data?.name, value: stat.data?.value })),
              timestamp: new Date().toISOString()
            });
            
            // Calculate average of current values
            const validStats = deviceStats.filter(stat => stat.data);
            if (validStats.length > 0) {
              const avgValue = validStats.reduce((sum, stat) => sum + (stat.data?.value || 0), 0) / validStats.length;
              setCurrentValue(avgValue); // Value is already in percentage (0-100)
            }
            
            // Fetch historical data
            console.log('📊 SummaryStatCard API Call: getDashboardDevicesStats (specific devices)', { 
              component: 'SummaryStatCard',
              title,
              deviceIds: sourceIds,
              metric,
              dateRange: {
                from: weekAgo.toDate(),
                to: now.toDate()
              },
              timestamp: new Date().toISOString()
            });
            const historicalStats = await getDashboardDevicesStats(sourceIds, metric, {
              from: weekAgo.toDate(),
              to: now.toDate(),
            });
            console.log('📊 SummaryStatCard API Response: getDashboardDevicesStats (specific devices)', { 
              component: 'SummaryStatCard',
              title,
              historicalStatsLength: historicalStats.data?.length || 0,
              historicalData: historicalStats.data,
              timestamp: new Date().toISOString()
            });
            
            let processedData: any[] = [];
            let finalCurrentValue = 0;
            if (historicalStats.data) {
              processedData = processHistoricalData(historicalStats.data);
              console.log('📊 SummaryStatCard: Processed sparkline data (specific devices)', {
                component: 'SummaryStatCard',
                title,
                rawDataLength: historicalStats.data.length,
                processedDataLength: processedData.length,
                processedData: processedData
              });
              setWeeklyData(processedData);
              calculateTrend(processedData);
            } else {
              console.log('📊 SummaryStatCard: No historical data for sparkline', {
                component: 'SummaryStatCard',
                title,
                historicalStats
              });
            }
            
            // Get current value from earlier calculation
            const validDeviceStats = deviceStats.filter(stat => stat.data);
            if (validDeviceStats.length > 0) {
              finalCurrentValue = validDeviceStats.reduce((sum, stat) => sum + (stat.data?.value || 0), 0) / validDeviceStats.length;
            }
            
            // Update debug data for specific devices
            if (updateDebugData) {
              updateDebugData({
                componentName: 'SummaryStatCard',
                fileName: 'SummaryStatCard.tsx',
                rawApiData: {
                  apiCalls: {
                    source: sourceIds,
                    isAllSelected: false,
                    sourceIds: sourceIds,
                    getDeviceStat: {
                      method: 'GET',
                      endpoint: `/api/statistics/device/{deviceId}/${metric}`,
                      description: 'Get current stats for specific devices',
                      deviceIds: sourceIds
                    },
                    getDashboardDevicesStats: {
                      method: 'POST',
                      endpoint: `/api/statistics/dashboard/stats/${metric}`,
                      params: {
                        from: weekAgo.toDate(),
                        to: moment().toDate()
                      },
                      body: {
                        devices: sourceIds
                      }
                    }
                  },
                  responses: {
                    deviceStats: deviceStats,
                    historicalStats: historicalStats
                  }
                } as Record<string, unknown>,
                processedData: {
                  currentValue: finalCurrentValue,
                  weeklyData: processedData,
                  deviceCount: sourceIds.length,
                  dateRange: {
                    from: weekAgo.toISOString(),
                    to: moment().toISOString()
                  }
                } as Record<string, unknown>,
                config: {
                  dataType,
                  source,
                  metric,
                  isAllSelected: false,
                  sourceIds
                } as Record<string, unknown>
              });
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
            
            // Get all containers from cache for historical data
            const containers = await entityCacheService.getContainers();
            const allContainerIds = containers.map(container => container.id);
            
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
                
                let processedData: any[] = [];
                if (combinedData.length > 0) {
                  processedData = processHistoricalData(combinedData);
                  setWeeklyData(processedData);
                  calculateTrend(processedData);
                } else {
                  // Use mock data if no historical data
                  processedData = generateMockSparklineData();
                  setWeeklyData(processedData);
                  calculateTrend(processedData);
                  setIsUsingMockData(true);
                }
                
                // Update debug data for containers (all)
                if (updateDebugData) {
                  updateDebugData({
                    componentName: 'SummaryStatCard',
                    fileName: 'SummaryStatCard.tsx',
                    rawApiData: {
                      apiCalls: {
                        source: 'all',
                        isAllSelected: true,
                        sourceIds: [],
                        getAveragedStats: {
                          method: 'GET',
                          endpoint: '/api/containers/stats/averaged',
                          description: 'Get averaged container stats'
                        },
                        getContainerStats: {
                          method: 'GET',
                          endpoint: `/api/containers/{containerId}/stats/${metric}`,
                          description: 'Get historical stats for containers',
                          containerIds: allContainerIds.slice(0, 10)
                        }
                      },
                      responses: {
                        avgStats: avgStats,
                        containers: { data: containers },
                        historicalResults: historicalResults
                      }
                    } as Record<string, unknown>,
                    processedData: {
                      currentValue: currentValue,
                      weeklyData: processedData,
                      containerCount: allContainerIds.length,
                      metric,
                      dataType
                    } as Record<string, unknown>,
                    config: {
                      dataType,
                      source,
                      metric,
                      isAllSelected: true
                    } as Record<string, unknown>
                  });
                }
              } catch (error) {
                console.error('Failed to fetch container historical data:', error);
                const mockData = generateMockSparklineData();
                setWeeklyData(mockData);
                calculateTrend(mockData);
                setIsUsingMockData(true);
              }
            } else {
              // Use mock data for sparkline
              const mockData = generateMockSparklineData();
              setWeeklyData(mockData);
              calculateTrend(mockData);
              setIsUsingMockData(true);
            }
          } else {
            // Fetch stats for specific containers
            if (sourceIds.length === 0) {
              // No specific containers selected
              setCurrentValue(0);
              setWeeklyData([]);
              return;
            }
            
            const containerPromises = sourceIds.map(containerId => 
              getContainerStat(containerId, metric)
            );
            const containerStats = await Promise.all(containerPromises);
            
            // Calculate average of current values
            const validContainerStats = containerStats.filter(stat => stat.data);
            let finalCurrentValue = 0;
            if (validContainerStats.length > 0) {
              const avgValue = validContainerStats.reduce((sum, stat) => sum + (stat.data?.value || 0), 0) / validContainerStats.length;
              setCurrentValue(avgValue); // Value is already in percentage (0-100)
              finalCurrentValue = avgValue;
            }
            
            // For now, use mock data for container sparklines
            // TODO: Implement historical container stats when available
            const mockData = generateMockSparklineData();
            setWeeklyData(mockData);
            calculateTrend(mockData);
            setIsUsingMockData(true);
            
            // Update debug data for specific containers
            if (updateDebugData) {
              updateDebugData({
                componentName: 'SummaryStatCard',
                fileName: 'SummaryStatCard.tsx',
                rawApiData: {
                  apiCalls: {
                    source: sourceIds,
                    isAllSelected: false,
                    sourceIds: sourceIds,
                    getContainerStat: {
                      method: 'GET',
                      endpoint: `/api/containers/{containerId}/stat/${metric}`,
                      description: 'Get current stats for specific containers',
                      containerIds: sourceIds
                    }
                  },
                  responses: {
                    containerStats: containerStats,
                    mockSparklineData: mockData
                  }
                } as Record<string, unknown>,
                processedData: {
                  currentValue: finalCurrentValue,
                  weeklyData: mockData,
                  containerCount: sourceIds.length,
                  metric,
                  dataType
                } as Record<string, unknown>,
                config: {
                  dataType,
                  source,
                  metric,
                  isAllSelected: false,
                  sourceIds
                } as Record<string, unknown>
              });
            }
          }
          
          // For containers without debug data, still add basic debug info
          if (!updateDebugData && dataType === 'container') {
            const mockData = generateMockSparklineData();
            setWeeklyData(mockData);
            calculateTrend(mockData);
            setIsUsingMockData(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Use default values on error
        setCurrentValue(parseFloat(defaultValue));
        setTrendValue(parseFloat(defaultTrend));
        
        // Update debug data for error case
        if (updateDebugData) {
          updateDebugData({
            componentName: 'SummaryStatCard',
            fileName: 'SummaryStatCard.tsx',
            rawApiData: {
              error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString()
              },
              fallbackData: {
                defaultValue: parseFloat(defaultValue),
                defaultTrend: parseFloat(defaultTrend)
              }
            } as Record<string, unknown>,
            processedData: {
              currentValue: parseFloat(defaultValue),
              trendValue: parseFloat(defaultTrend),
              weeklyData: [],
              errorOccurred: true
            } as Record<string, unknown>,
            config: {
              dataType,
              source,
              metric,
              defaultValue,
              defaultTrend
            } as Record<string, unknown>
          });
        }
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
    console.log('📊 SummaryStatCard: Processing historical data', {
      dataLength: data.length,
      sampleData: data.slice(0, 3)
    });
    
    // Ensure we have valid data
    if (!data || data.length === 0) {
      return [];
    }
    
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
    const processed = Object.keys(grouped)
      .sort()
      .map((hour, index) => ({
        index,
        value: grouped[hour].reduce((sum: number, val: number) => sum + val, 0) / grouped[hour].length
      }));
      
    console.log('📊 SummaryStatCard: Grouped data', {
      groupedKeys: Object.keys(grouped).length,
      processedLength: processed.length
    });
    
    // Ensure we have at least 2 points for the sparkline to render
    if (processed.length === 1) {
      // Duplicate the single point with slight variation
      const singleValue = processed[0].value;
      return [
        { index: 0, value: singleValue * 0.98 },
        { index: 1, value: singleValue }
      ];
    }
    
    return processed;
  };

  const calculateTrend = (data: any[]) => {
    console.log('📊 SummaryStatCard calculateTrend input:', { data, dataType: typeof data[0] });
    if (data.length < 2) return;
    
    // Compare last week's average with this week's average
    const midPoint = Math.floor(data.length / 2);
    const lastWeekData = data.slice(0, midPoint);
    const thisWeekData = data.slice(midPoint);
    
    const lastWeekAvg = lastWeekData.reduce((sum, item) => sum + item.value, 0) / lastWeekData.length;
    const thisWeekAvg = thisWeekData.reduce((sum, item) => sum + item.value, 0) / thisWeekData.length;
    
    const percentChange = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
    console.log('📊 SummaryStatCard calculateTrend result:', { 
      lastWeekAvg, thisWeekAvg, percentChange, 
      trendValue: Math.abs(percentChange), 
      direction: percentChange >= 0 ? 'up' : 'down' 
    });
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
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const dataPoint = weeklyData[dataPointIndex];
        const timestamp = dataPoint ? new Date(Date.now() - (weeklyData.length - dataPointIndex - 1) * 3600000).toLocaleString() : 'Unknown';
        
        return `
          <div style="padding: 8px 12px; background: rgba(0,0,0,0.75); color: white; box-shadow: 0px 0px 10px rgba(0,0,0,0.5); border-radius: 4px;">
            <div>${value.toFixed(1)}%</div>
            <div style="color: #8c8c8c; font-size: 11px; margin-top: 2px;">${timestamp}</div>
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
    data: weeklyData.map(item => item.value)
  }];

  // Debug log for sparkline rendering
  console.log('📊 SummaryStatCard: Sparkline render data', {
    component: 'SummaryStatCard',
    title,
    weeklyDataLength: weeklyData.length,
    weeklyData: weeklyData,
    chartSeries: chartSeries
  });

  const trendIcon = trendDirection === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendColor = trendDirection === 'up' ? WIDGET_COLORS.trend.up : WIDGET_COLORS.trend.down;

  return (
    <Card
      style={{
        ...WIDGET_CARD.base,
        ...cardStyle,
      }}
      bodyStyle={WIDGET_CARD.bodyStyle}
      loading={loading}
    >
      <DemoOverlay show={isUsingMockData} />
    
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Typography.Text style={WIDGET_TYPOGRAPHY.title}>
          {title}
        </Typography.Text>
        
        <Space
          align="end"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Space direction="vertical" size={8}>
            <Typography.Title
              level={2}
              style={WIDGET_TYPOGRAPHY.mainValue}
            >
              {formatValue(currentValue)}
            </Typography.Title>
            <Space align="center" size={6}>
              {trendIcon}
              <Typography.Text
                style={{ 
                  ...WIDGET_TYPOGRAPHY.trendValue,
                  color: trendColor,
                }}
              >
                {trendValue.toFixed(1)}%
              </Typography.Text>
              <Typography.Text
                style={WIDGET_TYPOGRAPHY.description}
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
            justifyContent: 'center',
            backgroundColor: weeklyData.length === 0 ? '#2a2a2a' : 'transparent',
            borderRadius: '4px'
          }}>
            {weeklyData.length > 0 ? (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="line"
                height={50}
                width={100}
              />
            ) : (
              <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                No data
              </div>
            )}
          </div>
        </Space>
      </Space>
      
    </Card>
  );
};

export default SummaryStatCard;
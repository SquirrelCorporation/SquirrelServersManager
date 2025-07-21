import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Space, Row, Col, Spin } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getPaletteColors } from './utils/colorPalettes';
import { 
  getDashboardDevicesStats,
  getDashboardAveragedDevicesStats
} from '@/services/rest/statistics/stastistics';
import { 
  getContainerStat
} from '@/services/rest/containers/container-statistics';
import { entityCacheService } from '@/services/cache/entityCache.service';
import moment from 'moment';
import { useWidgetContext } from './DashboardLayoutEngine/WidgetContext';
import { useRegisterDebugData } from './DashboardLayoutEngine/DebugDataProvider';
import DemoOverlay from './DemoOverlay';

interface LegendItem {
  name: string;
  value: string;
  color: string;
}

interface DonutChartProps {
  title: string;
  dataType?: 'device' | 'container';
  source?: string | string[];
  metric?: string;
  totalTours?: number;
  mainLabel?: string;
  chartData?: { type: string; value: number; color: string; originalValue?: number }[];
  legendItems?: LegendItem[];
  cardStyle?: React.CSSProperties;
  isPreview?: boolean;
  colorPalette?: string;
  customColors?: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({
  title,
  dataType = 'device',
  source = 'all',
  metric = 'cpu_usage',
  totalTours = 0,
  mainLabel = 'Total',
  chartData = [],
  legendItems = [],
  cardStyle,
  isPreview = false,
  colorPalette = 'default',
  customColors,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiChartData, setApiChartData] = useState<{ type: string; value: number; color: string; originalValue?: number }[]>([]);
  const [apiLegendItems, setApiLegendItems] = useState<LegendItem[]>([]);
  const [apiTotalValue, setApiTotalValue] = useState<number>(0);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  
  // Get widget context and debug registration
  const widgetContext = useWidgetContext();
  const updateDebugData = useRegisterDebugData(widgetContext?.widgetId);

  // Get colors from palette
  const paletteColors = useMemo(() => {
    return customColors && customColors.length > 0 ? customColors : getPaletteColors(colorPalette);
  }, [colorPalette, customColors]);

  // Determine if we're looking at all items or specific ones
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
      if (loading) return; // Prevent multiple simultaneous fetches
      setLoading(true);
      try {
        // Use provided data in preview mode or when static data is provided
        if (isPreview || (chartData && chartData.length > 0)) {
          setApiChartData(chartData);
          setApiLegendItems(legendItems);
          setApiTotalValue(totalTours);
          setIsUsingMockData(isPreview || true); // Mark as mock data when using static props
          setLoading(false);
          return;
        }

        // Fetch data from API
        const now = moment();
        const weekAgo = moment().subtract(7, 'days');
        
        // Reset mock data flag when fetching real data
        setIsUsingMockData(false);
        
        console.log('DonutChart date range:', {
          from: weekAgo.toISOString(),
          to: now.toISOString(),
          metric,
          dataType,
          source
        });
        
        const deviceOrContainerMap = new Map<string, { name: string; value: number }>();
        const apiResponses: any = {};

        if (dataType === 'device' && metric) {
          if (isAllSelected) {
            // Get all devices using cache
            console.log('📊 DonutChart: Getting all devices');
            const devices = await entityCacheService.getDevices();
            apiResponses.devices = { data: devices };
            const allDeviceIds = devices.map(device => device.uuid);
            
            console.log('📊 DonutChart - Device IDs retrieved:', {
              count: allDeviceIds.length,
              deviceIds: allDeviceIds
            });
            
            if (allDeviceIds.length > 0) {
              // Prepare API call parameters
              const avgStatsParams = {
                from: moment().subtract(1, 'hour').toDate(),
                to: moment().toDate(),
              };
              const historicalStatsParams = {
                from: weekAgo.toDate(),
                to: now.toDate(),
              };
              
              console.log('📊 DonutChart API Calls - Parameters:', {
                avgStats: {
                  method: 'getDashboardAveragedDevicesStats',
                  deviceIds: allDeviceIds,
                  metric: metric,
                  params: avgStatsParams,
                  body: { devices: allDeviceIds }
                },
                historicalStats: {
                  method: 'getDashboardDevicesStats', 
                  deviceIds: allDeviceIds,
                  metric: metric,
                  params: historicalStatsParams,
                  body: { devices: allDeviceIds }
                }
              });
              
              // Get averaged stats for each device to get their current values
              const [avgStats, historicalStats] = await Promise.all([
                getDashboardAveragedDevicesStats(allDeviceIds, metric, avgStatsParams),
                getDashboardDevicesStats(allDeviceIds, metric, historicalStatsParams),
              ]);
              
              apiResponses.avgStats = avgStats;
              apiResponses.historicalStats = historicalStats;
              
              console.log('📊 DonutChart API Responses:', {
                avgStats: {
                  success: avgStats.success,
                  dataLength: avgStats.data?.length || 0,
                  data: avgStats.data
                },
                historicalStats: {
                  success: historicalStats.success,
                  dataLength: historicalStats.data?.length || 0,
                  data: historicalStats.data
                }
              });
              
              // Process historical stats to get per-device values
              if (historicalStats.data && Array.isArray(historicalStats.data)) {
                console.log('DonutChart: Processing historical data', {
                  dataLength: historicalStats.data.length,
                  sample: historicalStats.data[0]
                });
                
                // Group by device and get latest value for each
                const deviceLatestValues = new Map<string, { value: number; date: string }>();
                
                historicalStats.data.forEach((stat: any) => {
                  // The API returns 'name' field with device UUID
                  const deviceId = stat.name || stat.deviceUuid;
                  if (deviceId && typeof stat.value === 'number') {
                    const existingEntry = deviceLatestValues.get(deviceId);
                    
                    if (!existingEntry || stat.date > existingEntry.date) {
                      deviceLatestValues.set(deviceId, {
                        value: stat.value,
                        date: stat.date
                      });
                    }
                  }
                });
                
                console.log('DonutChart: Device latest values', {
                  deviceCount: deviceLatestValues.size,
                  values: Array.from(deviceLatestValues.entries())
                });
                
                // Create chart data from latest values
                const nameMap = await entityCacheService.getEntitiesByIds('device', Array.from(deviceLatestValues.keys()));
                
                deviceLatestValues.forEach((entry, deviceId) => {
                  const deviceName = nameMap.get(deviceId) || deviceId;
                  deviceOrContainerMap.set(deviceId, {
                    name: deviceName,
                    value: entry.value
                  });
                });
              } else {
                console.log('DonutChart: No historical data available');
              }
            }
          } else {
            // Fetch specific devices
            console.log('📊 DonutChart - Fetching specific devices:', sourceIds);
            
            // Get device details from cache
            const devices = await entityCacheService.getDevices();
            apiResponses.devices = { data: devices };
            
            if (sourceIds.length > 0) {
              // Use the same API calls as for "all" but with specific device IDs
              const avgStatsParams = {
                from: moment().subtract(1, 'hour').toDate(),
                to: moment().toDate(),
              };
              const historicalStatsParams = {
                from: weekAgo.toDate(),
                to: now.toDate(),
              };
              
              console.log('📊 DonutChart API Calls (Specific Devices) - Parameters:', {
                deviceIds: sourceIds,
                avgStats: {
                  method: 'getDashboardAveragedDevicesStats',
                  deviceIds: sourceIds,
                  metric: metric,
                  params: avgStatsParams,
                  body: { devices: sourceIds }
                },
                historicalStats: {
                  method: 'getDashboardDevicesStats', 
                  deviceIds: sourceIds,
                  metric: metric,
                  params: historicalStatsParams,
                  body: { devices: sourceIds }
                }
              });
              
              const [avgStats, historicalStats] = await Promise.all([
                getDashboardAveragedDevicesStats(sourceIds, metric, avgStatsParams),
                getDashboardDevicesStats(sourceIds, metric, historicalStatsParams),
              ]);
              
              apiResponses.avgStats = avgStats;
              apiResponses.historicalStats = historicalStats;
              
              console.log('📊 DonutChart API Responses (Specific Devices):', {
                avgStats: {
                  success: avgStats.success,
                  dataLength: avgStats.data?.length || 0,
                  data: avgStats.data
                },
                historicalStats: {
                  success: historicalStats.success,
                  dataLength: historicalStats.data?.length || 0,
                  data: historicalStats.data
                }
              });
              
              // Process historical stats to get per-device values
              if (historicalStats.data && Array.isArray(historicalStats.data)) {
                console.log('DonutChart: Processing historical data for specific devices', {
                  dataLength: historicalStats.data.length,
                  sample: historicalStats.data[0]
                });
                
                // Group by device and get latest value for each
                const deviceLatestValues = new Map<string, { value: number; date: string }>();
                
                historicalStats.data.forEach((stat: any) => {
                  // The API returns 'name' field with device UUID
                  const deviceId = stat.name || stat.deviceUuid;
                  if (deviceId && typeof stat.value === 'number') {
                    const existingEntry = deviceLatestValues.get(deviceId);
                    
                    if (!existingEntry || stat.date > existingEntry.date) {
                      deviceLatestValues.set(deviceId, {
                        value: stat.value,
                        date: stat.date
                      });
                    }
                  }
                });
                
                console.log('DonutChart: Device latest values', {
                  deviceCount: deviceLatestValues.size,
                  values: Array.from(deviceLatestValues.entries())
                });
                
                // Create chart data from latest values
                const nameMap = await entityCacheService.getEntitiesByIds('device', Array.from(deviceLatestValues.keys()));
                
                deviceLatestValues.forEach((entry, deviceId) => {
                  const deviceName = nameMap.get(deviceId) || deviceId;
                  deviceOrContainerMap.set(deviceId, {
                    name: deviceName,
                    value: entry.value
                  });
                });
              }
            }
          }
        } else if (dataType === 'container' && metric) {
          if (isAllSelected) {
            // Get all containers from cache
            const containers = await entityCacheService.getContainers();
            apiResponses.containers = { data: containers };
            const allContainerIds = containers.map(container => container.id);
            
            // Limit to first 10 containers to prevent overload
            const limitedContainerIds = allContainerIds.slice(0, 10);
            
            // Get container names from cache
            const containerNameMap = await entityCacheService.getEntitiesByIds('container', limitedContainerIds);
            
            // Fetch current value for each container
            for (const containerId of limitedContainerIds) {
              const containerName = containerNameMap.get(containerId) || containerId;
              const statsResponse = await getContainerStat(
                containerId, 
                metric,
                {
                  from: weekAgo.toISOString(),
                  to: now.toISOString()
                }
              );
              
              if (statsResponse.success && statsResponse.data?.length > 0) {
                const latestValue = statsResponse.data[statsResponse.data.length - 1].value;
                deviceOrContainerMap.set(containerId, {
                  name: containerName,
                  value: latestValue
                });
              }
            }
          } else {
            // Fetch specific containers
            const containerNameMap = await entityCacheService.getEntitiesByIds('container', sourceIds);
            
            for (const containerId of sourceIds) {
              const containerName = containerNameMap.get(containerId) || containerId;
              const statsResponse = await getContainerStat(
                containerId, 
                metric,
                {
                  from: weekAgo.toISOString(),
                  to: now.toISOString()
                }
              );
              
              if (statsResponse.success && statsResponse.data?.length > 0) {
                const latestValue = statsResponse.data[statsResponse.data.length - 1].value;
                deviceOrContainerMap.set(containerId, {
                  name: containerName,
                  value: latestValue
                });
              }
            }
          }
        }

        // Convert map to chart data
        const items = Array.from(deviceOrContainerMap.values());
        
        let newChartData: { type: string; value: number; color: string; originalValue?: number }[] = [];
        let newLegendItems: LegendItem[] = [];
        let avgTotal = 0;
        
        // If we have items, show them; otherwise show "No data"
        if (items.length > 0) {
          const total = items.reduce((sum, item) => sum + item.value, 0);
          avgTotal = total / items.length; // Average percentage
          
          // Special case: Single device should show as progress circle (actual percentage)
          // Multiple devices should show as comparative donut (normalized proportions)
          if (items.length === 1) {
            // Single device: show actual percentage as progress circle
            const singleItem = items[0];
            const actualPercentage = singleItem.value;
            const remainingPercentage = 100 - actualPercentage;
            
            newChartData = [
              {
                type: singleItem.name || 'Used',
                value: actualPercentage, // Actual percentage (e.g., 3%)
                originalValue: actualPercentage,
                color: paletteColors[0] || '#52c41a'
              },
              {
                type: 'Available',
                value: remainingPercentage, // Remaining percentage (e.g., 97%)
                originalValue: remainingPercentage,
                color: 'rgba(255,255,255,0.1)' // Semi-transparent background
              }
            ];
            
            newLegendItems = [{
              name: singleItem.name || 'Usage',
              value: `${actualPercentage.toFixed(1)}%`,
              color: paletteColors[0] || '#52c41a'
            }];
          } else {
            // Multiple devices: normalize for comparative donut chart
            const totalValue = items.reduce((sum, item) => sum + item.value, 0);
            
            // If totalValue is 0, give equal segments to all devices
            const normalizedItems = totalValue > 0 
              ? items.map(item => ({
                  ...item,
                  // Each device gets a proportion of 100 based on its relative value
                  normalizedValue: (item.value / totalValue) * 100,
                  originalValue: item.value
                }))
              : items.map(item => ({
                  ...item,
                  // Equal segments if all values are 0
                  normalizedValue: 100 / items.length,
                  originalValue: item.value
                }));
            
            newChartData = normalizedItems.map((item, index) => ({
              type: item.name || `Device ${index + 1}`,
              value: item.normalizedValue, // Normalized to sum to 100 for full circle
              originalValue: item.originalValue, // Keep original percentage for display
              color: paletteColors[index % paletteColors.length] || '#cccccc'
            }));
            
            newLegendItems = normalizedItems.map((item, index) => ({
              name: item.name || `Device ${index + 1}`,
              value: `${item.originalValue.toFixed(1)}%`, // Show original percentage in legend
              color: paletteColors[index % paletteColors.length] || '#cccccc'
            }));
          }
          
          setApiChartData(newChartData);
          setApiLegendItems(newLegendItems);
          setApiTotalValue(avgTotal);
        } else {
          // No data available
          setApiChartData([]);
          setApiLegendItems([]);
          setApiTotalValue(0);
        }

        console.log('DonutChart final processed data:', {
          itemCount: items.length,
          items: items,
          originalTotal: items.reduce((sum, item) => sum + item.value, 0),
          normalizedTotal: newChartData.reduce((sum, item) => sum + item.value, 0),
          chartData: newChartData
        });
        
        // Include API call parameters in raw data for debugging
        const deviceIds = isAllSelected 
          ? (apiResponses.devices?.data?.map((d: any) => d.uuid) || [])
          : sourceIds;
          
        const debugData = {
          apiCalls: {
            source: source,
            isAllSelected: isAllSelected,
            sourceIds: sourceIds,
            getAllDevices: {
              method: 'GET',
              endpoint: '/api/devices'
            },
            getDashboardDevicesStats: {
              method: 'POST',
              endpoint: `/api/statistics/dashboard/stats/${metric}`,
              params: {
                from: weekAgo.toDate(),
                to: now.toDate()
              },
              body: {
                devices: deviceIds
              }
            },
            getDashboardAveragedDevicesStats: {
              method: 'POST', 
              endpoint: `/api/statistics/dashboard/averaged/${metric}`,
              params: {
                from: moment().subtract(1, 'hour').toDate(),
                to: moment().toDate()
              },
              body: {
                devices: deviceIds
              }
            }
          },
          responses: apiResponses
        };
        
        // Update debug data in the provider
        if (updateDebugData) {
          updateDebugData({
            componentName: 'DonutChart',
            fileName: 'DonutChart.tsx',
            rawApiData: debugData as Record<string, unknown>,
            processedData: {
              chartData: newChartData,
              legendItems: newLegendItems,
              totalValue: avgTotal
            } as Record<string, unknown>,
            config: {
              dataType,
              source,
              metric
            } as Record<string, unknown>
          });
        }
        
      } catch (error) {
        console.error('Error fetching donut chart data:', error);
        // Fallback to provided data if available
        setApiChartData(chartData);
        setApiLegendItems(legendItems);
        setApiTotalValue(totalTours);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType, source, metric, isAllSelected, sourceIds.join(','), isPreview, colorPalette, customColors?.join(',')]);

  // Use API data if available, otherwise fall back to provided data
  const displayChartData = apiChartData.length > 0 ? apiChartData : chartData;
  const displayLegendItems = apiLegendItems.length > 0 ? apiLegendItems : legendItems;
  const displayTotalValue = apiTotalValue > 0 ? apiTotalValue : totalTours;
  // Prepare data for ApexCharts - use display data
  const chartSeries = displayChartData?.map(item => item.value) || [];
  const chartLabels = displayChartData?.map(item => item.type) || [];
  const chartColors = displayChartData?.map(item => item.color) || [];
  
  console.log('DonutChart render data:', {
    displayChartData,
    chartSeries,
    chartLabels,
    loading
  });

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 120,
      background: 'transparent',
      animations: {
        enabled: false
      }
    },
    labels: chartLabels,
    colors: chartColors,
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: mainLabel,
              fontSize: '12px',
              fontWeight: 400,
              color: '#8c8c8c',
              formatter: function() {
                return displayTotalValue.toFixed(1) + '%';
              }
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 600,
              color: '#ffffff',
              offsetY: 8,
              formatter: function() {
                return '';
              }
            },
            name: {
              show: false
            }
          }
        }
      }
    },
    stroke: {
      width: 0
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: function(_val: number) {
          return _val.toFixed(1) + '%';
        }
      },
      custom: function({ series, seriesIndex, w }) {
        const label = w.globals.labels[seriesIndex];
        // Use original value if available, otherwise use the normalized value
        const originalValue = displayChartData[seriesIndex]?.originalValue;
        const displayValue = originalValue !== undefined ? originalValue : series[seriesIndex];
        
        // Hide tooltip for "Available" segment in single-device progress mode
        if (label === 'Available') {
          return '';
        }
        
        return `
          <div style="padding: 8px 12px; background: rgba(0,0,0,0.75); color: white; box-shadow: 0px 0px 10px rgba(0,0,0,0.5); border-radius: 4px;">
            <div>${label}: ${displayValue.toFixed(1)}%</div>
          </div>`;
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1
        }
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.1
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
        position: 'relative',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px' }}
      loading={loading}
    >
      <DemoOverlay show={isUsingMockData} />
    
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Typography.Text style={{ color: '#b8bac3', fontSize: '14px', fontWeight: 400 }}>
          {title}
        </Typography.Text>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {loading ? (
            <div style={{ height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin size="large" />
            </div>
          ) : chartSeries.length > 0 && chartSeries.every(v => typeof v === 'number' && !isNaN(v)) ? (
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={120}
              width={120}
            />
          ) : (
            <div style={{ height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8c8c8c' }}>
              No data available
            </div>
          )}
        </div>
        
        <Space
          direction="vertical"
          size={8}
          style={{ width: '100%' }}
        >
          {displayLegendItems?.map((item) => (
          <Row
            key={item.name}
            justify="space-between"
            style={{ width: '100%' }}
            align="middle"
          >
            <Col>
              <Space align="center" size={8}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: item.color,
                    borderRadius: '3px',
                  }}
                />
                <Typography.Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
                  {item.name}
                </Typography.Text>
              </Space>
            </Col>
            <Col>
              <Typography.Text
                style={{
                  color: '#f0f0f0',
                  fontWeight: '500',
                  fontSize: '13px',
                }}
              >
                {item.value}
              </Typography.Text>
            </Col>
          </Row>
        ))}
        </Space>
      </Space>
    </Card>
  );
};
export default DonutChart;

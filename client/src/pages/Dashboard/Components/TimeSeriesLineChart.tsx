import {
  getDashboardAveragedDevicesStats,
  getDashboardDevicesStats,
} from '@/services/rest/statistics/stastistics';
import Devicestatus from '@/utils/devicestatus';
import { getTimeDistance } from '@/utils/time';
import { LoadingOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useModel } from '@umijs/max';
import {
  Card,
  Col,
  DatePicker,
  Flex,
  Row,
  Select,
  Tabs,
  TabsProps,
  Typography,
} from 'antd';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { API, StatsType } from 'ssm-shared-lib';
import styles from '../Analysis.less';

const { RangePicker } = DatePicker;

const TimeSeriesLineChart: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser?: API.CurrentUser } = initialState || {};

  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<API.DeviceStat[] | undefined>([]);
  const [graphMemData, setGraphMemData] = useState<
    API.DeviceStat[] | undefined
  >([]);
  const [graphStorageData, setGraphStorageData] = useState<
    API.DeviceStat[] | undefined
  >([]);

  const [topTenData, setTopTenData] = useState<
    { name: string; value: number }[] | undefined
  >([]);
  const [devices, setDevices] = useState(
    currentUser?.devices?.overview
      ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
      .map((e) => e.uuid) || [],
  );
  const [type, setType] = useState<StatsType.DeviceStatsType>(
    StatsType.DeviceStatsType.CPU,
  );
  const [rangePickerValue, setRangePickerValue] = useState<any>(
    getTimeDistance('year'),
  );

  const isActive = useCallback(
    (dateType: string) => {
      const value = getTimeDistance(dateType);
      if (!rangePickerValue[0] || !rangePickerValue[1]) {
        return '';
      }
      if (
        rangePickerValue[0].isSame(value[0], 'day') &&
        rangePickerValue[1].isSame(value[1], 'day')
      ) {
        return styles.currentDate;
      }
      return '';
    },
    [rangePickerValue],
  );

  const handleRangePickerChange = useCallback((dates: any) => {
    setRangePickerValue(dates);
  }, []);

  const selectDate = useCallback((dateType: string) => {
    setRangePickerValue(getTimeDistance(dateType));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (devices.length > 0) {
        setGraphData(undefined);
        setGraphMemData(undefined);
        setGraphStorageData(undefined);
        setTopTenData(undefined);
        const [deviceStats, averagedDeviceStats] = await Promise.all([
          getDashboardDevicesStats(devices as string[], type, {
            from: rangePickerValue[0].toDate(),
            to: rangePickerValue[1].toDate(),
          }),
          getDashboardAveragedDevicesStats(devices as string[], type, {
            from: rangePickerValue[0].toDate(),
            to: rangePickerValue[1].toDate(),
          }),
        ]);
        console.log(deviceStats.data);
        switch (type) {
          case StatsType.DeviceStatsType.CPU:
            setGraphData(deviceStats.data);
            setTopTenData(averagedDeviceStats.data);
            break;
          case StatsType.DeviceStatsType.MEM_USED:
            setGraphMemData(deviceStats.data);
            setTopTenData(averagedDeviceStats.data);
            break;
          case StatsType.DeviceStatsType.DISK_USED:
            setGraphStorageData(deviceStats.data);
            setTopTenData(averagedDeviceStats.data);
            break;
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [devices, type, rangePickerValue]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Prepare data for ApexCharts
  const prepareChartData = useCallback((data: API.DeviceStat[] | undefined) => {
    if (!data || data.length === 0) return { series: [], categories: [] };
    
    // Group data by device name
    const deviceMap = new Map<string, { x: string; y: number }[]>();
    
    data.forEach((item) => {
      const deviceName = item.name || 'Unknown';
      if (!deviceMap.has(deviceName)) {
        deviceMap.set(deviceName, []);
      }
      
      // Parse the date string
      let dateStr = item.date;
      if (typeof dateStr === 'string' && dateStr.includes('-') && dateStr.split('-').length > 3) {
        const parts = dateStr.split('-');
        dateStr = `${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}`;
      }
      
      deviceMap.get(deviceName)!.push({
        x: new Date(dateStr).getTime(),
        y: parseFloat(item.value.toFixed(2))
      });
    });
    
    // Convert to ApexCharts series format
    const series = Array.from(deviceMap.entries()).map(([name, data]) => ({
      name,
      data: data.sort((a, b) => a.x - b.x)
    }));
    
    return { series };
  }, []);

  const getChartOptions = useCallback((): ApexOptions => ({
    chart: {
      type: 'line',
      height: 400,
      toolbar: {
        show: false
      },
      background: 'transparent',
      animations: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#fff',
          fontSize: '12px'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm'
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
          colors: '#fff',
          fontSize: '12px'
        },
        formatter: (value: number) => `${value.toFixed(2)}%`
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
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#fff'
      }
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      y: {
        formatter: (value: number) => `${value.toFixed(2)}%`
      }
    },
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']
  }), []);

  const cpuChartData = useMemo(() => prepareChartData(graphData), [graphData, prepareChartData]);
  const memChartData = useMemo(() => prepareChartData(graphMemData), [graphMemData, prepareChartData]);
  const storageChartData = useMemo(() => prepareChartData(graphStorageData), [graphStorageData, prepareChartData]);


  const handleTabChange = (key: string) => {
    setType(key as StatsType.DeviceStatsType);
  };

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: StatsType.DeviceStatsType.CPU,
        label: 'CPU',
        children: (
          <Row>
            <Col xl={16} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesBar}>
                {loading ? (
                  <Flex
                    justify={'center'}
                    align={'center'}
                    style={{ height: 400 }}
                  >
                    <LoadingOutlined style={{ fontSize: '32px' }} />
                  </Flex>
                ) : (
                  <ReactApexChart
                    options={getChartOptions()}
                    series={cpuChartData.series}
                    type="line"
                    height={400}
                  />
                )}
              </div>
            </Col>
            <Col xl={8} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesRank}>
                <h4 className={styles.rankingTitle}>
                  CPU Usage % Average Ranking
                </h4>
                <ul className={styles.rankingList}>
                  {topTenData?.slice(0, 10).map((item, i) => (
                    <li
                      key={`${item.name}-${i}`}
                      className={styles.rankingItem}
                    >
                      <span
                        className={`${styles.rankingItemNumber} ${i < 3 ? styles.active : ''}`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={styles.rankingItemTitle}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <span className={styles.rankingItemValue}>
                        {item.value?.toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        ),
      },
      {
        key: StatsType.DeviceStatsType.MEM_USED,
        label: 'MEM',
        children: (
          <Row>
            <Col xl={16} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesBar}>
                {loading ? (
                  <Flex
                    justify={'center'}
                    align={'center'}
                    style={{ height: 400 }}
                  >
                    <LoadingOutlined style={{ fontSize: '32px' }} />
                  </Flex>
                ) : (
                  <ReactApexChart
                    options={getChartOptions()}
                    series={memChartData.series}
                    type="line"
                    height={400}
                  />
                )}
              </div>
            </Col>
            <Col xl={8} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesRank}>
                <h4 className={styles.rankingTitle}>
                  Memory Usage % Average Ranking
                </h4>
                <ul className={styles.rankingList}>
                  {topTenData?.slice(0, 10).map((item, i) => (
                    <li key={item.name}>
                      <span
                        className={`${styles.rankingItemNumber} ${i < 3 ? styles.active : ''}`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={styles.rankingItemTitle}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <span className={styles.rankingItemValue}>
                        {item.value?.toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        ),
      },
      {
        key: StatsType.DeviceStatsType.DISK_USED,
        label: 'DISK',
        children: (
          <Row>
            <Col xl={16} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesBar}>
                {loading ? (
                  <Flex
                    justify={'center'}
                    align={'center'}
                    style={{ height: 400 }}
                  >
                    <LoadingOutlined style={{ fontSize: '32px' }} />
                  </Flex>
                ) : (
                  <ReactApexChart
                    options={getChartOptions()}
                    series={storageChartData.series}
                    type="line"
                    height={400}
                  />
                )}
              </div>
            </Col>
            <Col xl={8} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesRank}>
                <h4 className={styles.rankingTitle}>
                  Disk Usage % Average Ranking
                </h4>
                <ul className={styles.rankingList}>
                  {topTenData?.slice(0, 10).map((item, i) => (
                    <li
                      key={`${item.name}-${i}`}
                      className={styles.rankingItem}
                    >
                      <span
                        className={`${styles.rankingItemNumber} ${i < 3 ? styles.active : ''}`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={styles.rankingItemTitle}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <span className={styles.rankingItemValue}>
                        {item.value?.toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        ),
      },
    ],
    [cpuChartData, memChartData, storageChartData, topTenData, loading, getChartOptions],
  );

  const tabBarExtra = useMemo(
    () => (
      <div className={styles.salesExtraWrap}>
        <div className={styles.salesExtra}>
          {['today', 'week', 'month', 'year'].map((period) => (
            <a
              key={period}
              className={isActive(period)}
              onClick={() => selectDate(period)}
            >
              <Typography.Text style={{ color: 'inherit' }}>
                {`All ${period.charAt(0).toUpperCase() + period.slice(1)}`}
              </Typography.Text>
            </a>
          ))}
        </div>
        <RangePicker
          value={rangePickerValue}
          onChange={handleRangePickerChange}
          style={{ width: 256 }}
        />
        <Select
          defaultValue={devices}
          placeholder="Outlined"
          mode="multiple"
          showSearch
          maxTagCount="responsive"
          style={{ flex: 1, width: 120, marginLeft: 5 }}
          options={currentUser?.devices?.overview
            ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
            .map((e) => ({
              value: e.uuid,
              label: e.name,
            }))}
          onChange={setDevices}
        />
      </div>
    ),
    [
      devices,
      rangePickerValue,
      selectDate,
      handleRangePickerChange,
      isActive,
      currentUser?.devices?.overview,
    ],
  );

  return (
    <Card 
      bordered={false} 
      bodyStyle={{ padding: 0 }}
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        height: '100%',
      }}
    >
      <div className={styles.salesCard}>
        <Tabs
          onChange={handleTabChange}
          items={items}
          animated
          tabBarExtraContent={tabBarExtra}
          size="large"
          tabBarStyle={{ 
            marginBottom: 24, 
            marginLeft: 25,
            borderBottom: '1px solid #3a3a3e'
          }}
        />
      </div>
    </Card>
  );
};

export default React.memo(TimeSeriesLineChart);

import {
  getDashboardAveragedDevicesStats,
  getDashboardDevicesStats,
} from '@/services/rest/devicestat';
import Devicestatus from '@/utils/devicestatus';
import { getTimeDistance } from '@/utils/time';
import { LoadingOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
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
import QueueAnim from 'rc-queue-anim';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { API } from 'ssm-shared-lib';
import styles from '../Analysis.less';

const { RangePicker } = DatePicker;

const MainChartCard: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser: API.CurrentUser } = initialState || {};

  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [topTenData, setTopTenData] = useState<
    { name: string; value: number }[]
  >([]);
  const [devices, setDevices] = useState(
    currentUser?.devices?.overview
      ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
      .map((e) => e.uuid) || [],
  );
  const [type, setType] = useState('cpu');
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
        setGraphData(deviceStats.data);
        setTopTenData(averagedDeviceStats.data);
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

  const cpuConfig = useMemo(
    () => ({
      data: graphData,
      loading,
      animate: { enter: { type: 'waveIn' } },
      theme: {
        view: {
          viewFill: '#151921',
        },
      },
      loadingTemplate: (
        <Flex
          justify={'center'}
          style={{ backgroundColor: '#151921', width: '100%', height: '100%' }}
        >
          <LoadingOutlined style={{ fontSize: '32px' }} />
        </Flex>
      ),
      xField: 'date',
      yField: 'value',
      colorField: 'name',
      seriesField: 'name',
      xAxis: {
        type: 'time',
      },
      legend: {
        color: {
          itemLabelFill: '#fff',
        },
      },
      axis: {
        x: {
          labelFill: '#fff',
        },
        y: {
          labelFill: '#fff',
          labelFormatter: (v: any) => `${v}%`,
        },
      },
      tooltip: {
        channel: 'y',
        valueFormatter: (d: string) => `${parseFloat(d).toFixed(2)}%`,
      },
      yAxis: {
        label: {
          formatter: (v: number) => `${v.toFixed(2)}%`,
        },
      },
    }),
    [graphData, loading],
  );

  const memConfig = useMemo(
    () => ({
      ...cpuConfig,
      // Customize further if needed
    }),
    [cpuConfig],
  );

  const handleTabChange = (key: string) => {
    setType(key);
  };

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'cpu',
        label: 'CPU',
        children: (
          <Row>
            <Col xl={16} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesBar}>
                <Line {...cpuConfig} />
              </div>
            </Col>
            <Col xl={8} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesRank}>
                <h4 className={styles.rankingTitle}>CPU Average Ranking</h4>
                <ul className={styles.rankingList}>
                  {topTenData.slice(0, 10).map((item, i) => (
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
                        {item.value.toFixed(2)}%
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
        key: 'memFree',
        label: 'MEM',
        children: (
          <Row>
            <Col xl={16} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesBar}>
                <Line {...memConfig} />
              </div>
            </Col>
            <Col xl={8} lg={12} md={12} sm={24} xs={24}>
              <div className={styles.salesRank}>
                <h4 className={styles.rankingTitle}>Average Memory Ranking</h4>
                <ul className={styles.rankingList}>
                  {topTenData.slice(0, 10).map((item, i) => (
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
                        {item.value.toFixed(2)}%
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
    [cpuConfig, memConfig, topTenData],
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
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <div className={styles.salesCard}>
        <Tabs
          onChange={handleTabChange}
          items={items}
          animated
          tabBarExtraContent={tabBarExtra}
          size="large"
          tabBarStyle={{ marginBottom: 24, marginLeft: 25 }}
        />
      </div>
    </Card>
  );
};

export default React.memo(MainChartCard);

import {
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Tabs,
  TabsProps,
  Typography,
} from 'antd';
import styles from '../Analysis.less';
import { Line } from '@ant-design/plots';
import React, { useEffect, useState } from 'react';
import {
  getDashboardAveragedDevicesStats,
  getDashboardDevicesStats,
} from '@/services/rest/devicestat';
import { useModel } from '@umijs/max';
import { getTimeDistance } from '@/utils/time';
import Devicestatus from '@/utils/devicestatus';
import { API } from 'ssm-shared-lib';

const { RangePicker } = DatePicker;

const MainChartCard: React.FC<any> = ({}) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser: API.CurrentUser } = initialState || {};
  const [graphData, setGraphData] = useState([]);
  const [topTenData, setTopTenData] = useState<
    [{ value: number; name: string }] | []
  >([]);
  const [devices, setDevices] = useState(
    currentUser?.devices?.overview
      ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
      .map((e) => e.uuid) || [],
  );
  const [type, setType] = useState('cpu');
  const [rangePickerValue, setRangePickerValue] = React.useState(
    getTimeDistance('year'),
  );

  const isActive = (dateType: string) => {
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
  };

  const handleRangePickerChange = (newRangePickerValue: any) => {
    setRangePickerValue(newRangePickerValue);
  };

  const selectDate = (dateType: string) => {
    setRangePickerValue(getTimeDistance(dateType));
  };
  const asyncFetch = async () => {
    if (devices && devices.length > 0) {
      await getDashboardDevicesStats(devices, type, {
        from: rangePickerValue[0].toDate(),
        to: rangePickerValue[1].toDate(),
      })
        .then((response) => {
          setGraphData(response.data);
        })
        .catch((error) => {
          console.log('fetch data failed', error);
        });
      await getDashboardAveragedDevicesStats(devices, type, {
        from: rangePickerValue[0].toDate(),
        to: rangePickerValue[1].toDate(),
      })
        .then((response) => setTopTenData(response.data))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    }
  };

  useEffect(() => {
    asyncFetch();
  }, [devices, type, rangePickerValue]);

  const config = {
    data: graphData,
    theme: 'dark',
    xField: 'date',
    yField: 'value',
    colorField: 'name',
    seriesField: 'name',
    xAxis: {
      type: 'time',
    },
    tooltip: { channel: 'y', valueFormatter: '.2' },
    yAxis: {
      label: {
        formatter: (v: any) => `${v.toFixed(2)}%`,
      },
    },
  };

  const onChange = (key: string) => {
    setType(key);
  };

  const items: TabsProps['items'] = [
    {
      key: 'cpu',
      label: 'CPU',
      children: (
        <Row>
          <Col xl={16} lg={12} md={12} sm={24} xs={24}>
            <div className={styles.salesBar}>
              <Line {...config} />
            </div>
          </Col>
          <Col xl={8} lg={12} md={12} sm={24} xs={24}>
            <div className={styles.salesRank}>
              <h4 className={styles.rankingTitle}>CPU Average Ranking</h4>
              <ul className={styles.rankingList}>
                {topTenData.slice(0, 10).map((item, i) => (
                  <li key={item.name}>
                    <span
                      className={`${styles.rankingItemNumber} ${i < 3 ? styles.active : ''}`}
                    >
                      {i + 1}
                    </span>
                    <span className={styles.rankingItemTitle} title={item.name}>
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
              <Line {...config} />
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
                    <span className={styles.rankingItemTitle} title={item.name}>
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
  ];
  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <div className={styles.salesCard}>
        <Tabs
          onChange={onChange}
          items={items}
          animated
          tabBarExtraContent={
            <div className={styles.salesExtraWrap}>
              <div className={styles.salesExtra}>
                <a
                  className={isActive('today')}
                  onClick={() => selectDate('today')}
                >
                  <Typography.Text style={{ color: 'inherit' }}>
                    All Day
                  </Typography.Text>
                </a>
                <a
                  className={isActive('week')}
                  onClick={() => selectDate('week')}
                >
                  <Typography.Text style={{ color: 'inherit' }}>
                    All Week
                  </Typography.Text>
                </a>
                <a
                  className={isActive('month')}
                  onClick={() => selectDate('month')}
                >
                  <Typography.Text style={{ color: 'inherit' }}>
                    All Month
                  </Typography.Text>
                </a>
                <a
                  className={isActive('year')}
                  onClick={() => selectDate('year')}
                >
                  <Typography.Text style={{ color: 'inherit' }}>
                    All Year
                  </Typography.Text>
                </a>
              </div>
              <RangePicker
                value={rangePickerValue}
                onChange={handleRangePickerChange}
                style={{ width: 256 }}
              />
              <Select
                defaultValue={devices}
                placeholder="Outlined"
                mode={'multiple'}
                showSearch
                maxTagCount={'responsive'}
                style={{ flex: 1, width: 120, marginLeft: 5 }}
                options={currentUser?.devices?.overview
                  ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
                  .map((e) => {
                    return { value: e.uuid, label: e.name };
                  })}
                onChange={(e) => {
                  setDevices(e);
                }}
              />
            </div>
          }
          size="large"
          tabBarStyle={{ marginBottom: 24, marginLeft: 25 }}
        />
      </div>
    </Card>
  );
};

export default MainChartCard;

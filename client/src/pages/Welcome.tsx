import DemoLine from '@/components/Charts/Lines';
import { ClusterOutlined, UpCircleOutlined } from '@ant-design/icons';
import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Col, Row, theme } from 'antd';
import React from 'react';
import TotalDeviceCard from "@/pages/Dashboard/TotalDeviceCard";
import MainChartCard from "@/pages/Dashboard/Components/MainChartCard";
import moment from "moment";
import styles from './Dashboard/Analysis.less';

export function fixedZero(val: number) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type: string) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

const Welcome: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [rangePickerValue, setRangePickerValue ] = React.useState(getTimeDistance('year'));
  const [loading, setLoading] = React.useState(false);
  const imgStyle = {
    display: 'block',
    width: 42,
    height: 42,
  };

  const isActive = (type: string) => {
    const value = getTimeDistance(type);
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

  const handleRangePickerChange = (newRangePickerValue) => {
    setRangePickerValue(newRangePickerValue);
  };

  const selectDate = (type: string) => {
    setRangePickerValue(getTimeDistance(type))
  };
  return (
    <PageContainer>
      <TotalDeviceCard/>
      <MainChartCard
        rangePickerValue={rangePickerValue}
        isActive={isActive}
        handleRangePickerChange={handleRangePickerChange}
        loading={loading}
        selectDate={selectDate}
      />
    </PageContainer>
  );
};

export default Welcome;

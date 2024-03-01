import { Card, Col, DatePicker, Row, Tabs, Tooltip, Typography } from 'antd';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
import styles from './Analysis.less';
import React from 'react';
import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import Icon from 'antd/es/icon';
import { ClusterOutlined, InfoCircleFilled } from '@ant-design/icons';
import Trend from '@/pages/Dashboard/ChartComponents/Trend';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import { Gauge, Tiny } from '@ant-design/plots';
import MiniProgress from '@/pages/Dashboard/ChartComponents/MiniProgress';
import SystemPerformanceCard from '@/pages/Dashboard/Components/SystemPerformanceCard';
import CombinedPowerCard from '@/pages/Dashboard/Components/CombinedPowerCard';
import AvailabilityCard from '@/pages/Dashboard/Components/AvailabilityCard';

const rankingListData = [];
for (let i = 0; i < 7; i += 1) {
  rankingListData.push({
    title: `test${i}`,
    total: 4 * Math.random(),
  });
}

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const TotalDeviceCard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const config = {
    height: 60,
    autoFit: false,
    xField: 'title',
    width: 250,
    yField: 'total',
    tooltip: { channel: 'y' },
    data: rankingListData,
    smooth: true,
  };

  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <SystemPerformanceCard />
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title={
            <Typography.Title level={5}>Services Running</Typography.Title>
          }
          action={
            <Tooltip title={'Introduce'}>
              <InfoCircleFilled style={{ color: 'white' }} />
            </Tooltip>
          }
          total={<Typography.Title level={3}>126560</Typography.Title>}
          footer={
            <Field
              label={<Typography.Text>Daily Sales</Typography.Text>}
              value={<Typography.Text>000</Typography.Text>}
            />
          }
          contentHeight={80}
        >
          <Tiny.Column {...config} />
        </ChartCard>
      </Col>
      <Col {...topColResponsiveProps}>
        <CombinedPowerCard />
      </Col>
      <Col {...topColResponsiveProps}>
        <AvailabilityCard />
      </Col>
    </Row>
  );
};
export default TotalDeviceCard;

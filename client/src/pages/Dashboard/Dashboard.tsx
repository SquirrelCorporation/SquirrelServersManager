import { Col, Row } from 'antd';
import React from 'react';
import SystemPerformanceCard from '@/pages/Dashboard/Components/SystemPerformanceCard';
import CombinedPowerCard from '@/pages/Dashboard/Components/CombinedPowerCard';
import AvailabilityCard from '@/pages/Dashboard/Components/AvailabilityCard';
import ServicesCard from '@/pages/Dashboard/Components/ServicesCard';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const Dashboard: React.FC = () => {
  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <SystemPerformanceCard />
      </Col>
      <Col {...topColResponsiveProps}>
        <ServicesCard />
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
export default Dashboard;

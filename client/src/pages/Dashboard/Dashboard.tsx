import AvailabilityCard from '@/pages/Dashboard/Components/AvailabilityCard';
import CombinedPowerCard from '@/pages/Dashboard/Components/CombinedPowerCard';
import ServicesCard from '@/pages/Dashboard/Components/ServicesCard';
import SystemPerformanceCard from '@/pages/Dashboard/Components/SystemPerformanceCard';
import { Col, Row } from 'antd';
import React from 'react';

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

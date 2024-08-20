import AvailabilityCard from '@/pages/Dashboard/Components/AvailabilityCard';
import CombinedPowerCard from '@/pages/Dashboard/Components/CombinedPowerCard';
import ServicesCard from '@/pages/Dashboard/Components/ServicesCard';
import SystemPerformanceCard from '@/pages/Dashboard/Components/SystemPerformanceCard';
import { Col, Row } from 'antd';
import React from 'react';
import { motion } from 'framer-motion';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.4,
    },
  }),
};

const DashboardTop: React.FC = () => {
  const cards = [
    <SystemPerformanceCard key={'system-perf'} />,
    <ServicesCard key={'services'} />,
    <CombinedPowerCard key={'combined-pws'} />,
    <AvailabilityCard key={'availability'} />,
  ];

  return (
    <Row gutter={24}>
      {cards.map((card, index) => (
        <Col key={index} {...topColResponsiveProps}>
          <motion.div
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            {card}
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardTop;

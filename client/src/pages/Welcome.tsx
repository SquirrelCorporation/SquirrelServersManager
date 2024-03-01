import { PageContainer } from '@ant-design/pro-components';
import React from 'react';
import Dashboard from '@/pages/Dashboard/Dashboard';
import MainChartCard from '@/pages/Dashboard/Components/MainChartCard';
import moment from 'moment';
import styles from './Dashboard/Analysis.less';

const Welcome: React.FC = () => {
  return (
    <PageContainer>
      <Dashboard />
      <MainChartCard />
    </PageContainer>
  );
};

export default Welcome;

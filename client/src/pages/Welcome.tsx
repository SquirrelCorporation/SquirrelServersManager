import MainChartCard from '@/pages/Dashboard/Components/MainChartCard';
import Dashboard from '@/pages/Dashboard/Dashboard';
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';

const Welcome: React.FC = () => {
  return (
    <PageContainer header={{ title: undefined }}>
      <Dashboard />
      <MainChartCard />
    </PageContainer>
  );
};

export default Welcome;

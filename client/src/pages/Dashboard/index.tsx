import MainChartCard from '@/pages/Dashboard/Components/MainChartCard';
import DashboardTop from '@/pages/Dashboard/Components/DashboardTop';
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';

const Index: React.FC = () => {
  return (
    <PageContainer header={{ title: undefined }}>
      <DashboardTop />
      <MainChartCard />
    </PageContainer>
  );
};

export default Index;

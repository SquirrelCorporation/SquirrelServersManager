import MainChartCard from '@/pages/Dashboard/Components/MainChartCard';
import DashboardTop from '@/pages/Dashboard/Components/DashboardTop';
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';
import { useSlot } from '@/plugins/contexts/plugin-context';

const Index: React.FC = () => {
  // Get the dashboard widgets slot renderer
  const DashboardWidgetsSlot = useSlot('dashboard-widgets');
  
  return (
    <PageContainer header={{ title: undefined }}>
      <DashboardTop />
      <MainChartCard />
      
      {/* Render plugin dashboard widgets */}
      <div style={{ marginTop: '24px' }}>
        <DashboardWidgetsSlot />
      </div>
    </PageContainer>
  );
};

export default Index;

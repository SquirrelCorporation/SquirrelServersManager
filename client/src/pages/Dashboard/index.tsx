import React from 'react';
import {
  DashboardOutlined,
  LayoutOutlined,
} from '@ant-design/icons';

// Layout Components
import StyledTabContainer, {
  IconWrapper,
  TabLabel,
} from '@/components/Layout/StyledTabContainer';

// Existing Dashboard Components
import TimeSeriesLineChart from '@/pages/Dashboard/Components/TimeSeriesLineChart';
import DashboardTop from '@/pages/Dashboard/Components/DashboardTop';
import { useSlot } from '@/plugins/contexts/plugin-context';


// Customizable Dashboard Engine
import DashboardLayoutEngine from '@/pages/Dashboard/Components/DashboardLayoutEngine';
import { createDashboardItems } from '@/pages/Dashboard/Components/DashboardItemsFactory';


const Index: React.FC = () => {
  // Get the dashboard widgets slot renderer
  const DashboardWidgetsSlot = useSlot('dashboard-widgets');
  // Create available dashboard items for the customizable dashboard
  const availableDashboardItems = createDashboardItems();

  const tabItems = [
    {
      key: 'main',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="#1890ff">
            <DashboardOutlined />
          </IconWrapper>
          <span>Main Dashboard</span>
        </TabLabel>
      ),
      children: (
        <>
          <DashboardTop />
          <TimeSeriesLineChart />
          {/* Render plugin dashboard widgets */}
          <div style={{ marginTop: '24px' }}>
            <DashboardWidgetsSlot />
          </div>
        </>
      ),
    },
    {
      key: 'customizable',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="#722ed1">
            <LayoutOutlined />
          </IconWrapper>
          <span>Customizable Dashboard</span>
        </TabLabel>
      ),
      children: (
        <DashboardLayoutEngine availableItems={availableDashboardItems} />
      ),
    },
  ];

  return (
    <StyledTabContainer
      header={{
        title: 'Dashboard Overview',
      }}
      tabItems={tabItems}
      defaultActiveKey="main"
    />
  );
};

export default Index;

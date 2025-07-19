import React, { useState, useEffect, useCallback } from 'react';
import {
  DashboardOutlined,
  LayoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import dashboardService from '@/services/rest/dashboard.service';
import type { Dashboard, DashboardPage } from '@/services/rest/dashboard.service';

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
  
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [refreshKey]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const currentDashboard = await dashboardService.getCurrentDashboard();
      setDashboard(currentDashboard);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = useCallback(async () => {
    if (!dashboard) return;
    
    try {
      const newPageName = `Dashboard ${dashboard.pages.length + 1}`;
      const newPage: DashboardPage = {
        id: `page-${Date.now()}`,
        name: newPageName,
        order: dashboard.pages.length,
        widgets: [],
      };
      
      const updatedDashboard = await dashboardService.update(dashboard._id!, {
        pages: [...dashboard.pages, newPage],
      });
      
      setDashboard(updatedDashboard);
      message.success(`Created new page: ${newPageName}`);
      // Force refresh to update tabs
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add page:', error);
      message.error('Failed to create new page');
    }
  }, [dashboard]);

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
    // Add customizable dashboard pages
    ...(dashboard?.pages || []).map((page) => ({
      key: page.id,
      label: (
        <TabLabel>
          <IconWrapper $bgColor="#722ed1">
            <LayoutOutlined />
          </IconWrapper>
          <span>{page.name}</span>
        </TabLabel>
      ),
      children: (
        <DashboardLayoutEngine 
          key={page.id}
          availableItems={availableDashboardItems}
          pageId={page.id}
          onDeletePage={() => setRefreshKey(prev => prev + 1)}
        />
      ),
    })),
    // Add Page button
    {
      key: 'add-page',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="#52c41a">
            <PlusOutlined />
          </IconWrapper>
          <span>Add Page</span>
        </TabLabel>
      ),
      children: null,
    },
  ];

  return (
    <StyledTabContainer
      header={{
        title: 'Dashboard Overview',
      }}
      tabItems={tabItems}
      defaultActiveKey="main"
      onTabClick={(key) => {
        if (key === 'add-page') {
          handleAddPage();
        }
      }}
    />
  );
};

export default Index;

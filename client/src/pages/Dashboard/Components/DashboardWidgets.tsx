import React, { useState, useCallback } from 'react';
import { Col, Row, Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import NotebookWidget from './NotebookWidget';
import RSSFeedWidget from './RSSFeedWidget';
import IFrameWidget from './IFrameWidget';
import QuickActionsWidget from './QuickActionsWidget';
import AnsiblePlaybookRunner from './AnsiblePlaybookRunner';
import ContainerUpdateCenter from './ContainerUpdateCenter';
import MaintenanceCalendar from './MaintenanceCalendar';
import SystemPerformanceCard from './SystemPerformanceCard';
import AvailabilityCard from './AvailabilityCard';
import ContainersCard from './ContainersCard';
import CombinedPowerCard from './CombinedPowerCard';
import MainChartCard from './MainChartCard';
import DashboardWidgetDrawer from './DashboardWidgetDrawer';

const widgetColProps = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 8,
  style: { marginBottom: 24 },
};

const largeWidgetColProps = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 16,
  xl: 12,
  style: { marginBottom: 24 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
    },
  }),
};

const DashboardWidgets: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('ssm-dashboard-active-widgets');
    return saved ? JSON.parse(saved) : [
      'QuickActionsWidget',
      'AnsiblePlaybookRunner', 
      'ContainerUpdateCenter',
      'NotebookWidget',
      'RSSFeedWidget',
      'IFrameWidget',
      'MaintenanceCalendar'
    ];
  });

  const handleWidgetAdd = useCallback((widgetKey: string, category: string) => {
    if (!activeWidgets.includes(widgetKey)) {
      const newWidgets = [...activeWidgets, widgetKey];
      setActiveWidgets(newWidgets);
      localStorage.setItem('ssm-dashboard-active-widgets', JSON.stringify(newWidgets));
    }
  }, [activeWidgets]);

  const getWidgetComponent = (widgetKey: string) => {
    const components: Record<string, React.ReactElement> = {
      // Monitoring & Analytics
      SystemPerformanceCard: <SystemPerformanceCard key={widgetKey} />,
      AvailabilityCard: <AvailabilityCard key={widgetKey} />,
      ContainersCard: <ContainersCard key={widgetKey} />,
      CombinedPowerCard: <CombinedPowerCard key={widgetKey} />,
      MainChartCard: <MainChartCard key={widgetKey} />,
      
      // Operations & Management
      QuickActionsWidget: <QuickActionsWidget key={widgetKey} />,
      AnsiblePlaybookRunner: <AnsiblePlaybookRunner key={widgetKey} />,
      ContainerUpdateCenter: <ContainerUpdateCenter key={widgetKey} />,
      MaintenanceCalendar: <MaintenanceCalendar key={widgetKey} />,
      
      // Productivity & Integration
      NotebookWidget: <NotebookWidget key={widgetKey} />,
      RSSFeedWidget: <RSSFeedWidget key={widgetKey} />,
      IFrameWidget: <IFrameWidget 
        key={widgetKey}
        title="Monitoring Dashboard"
        defaultUrl="http://localhost:3000"
        allowedDomains={['localhost', '127.0.0.1', 'grafana.local']}
      />,
    };
    return components[widgetKey] || null;
  };

  const getColProps = (widgetKey: string) => {
    const largeWidgets = ['IFrameWidget', 'MaintenanceCalendar', 'MainChartCard'];
    return largeWidgets.includes(widgetKey) ? largeWidgetColProps : widgetColProps;
  };

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>
          Dashboard Widgets
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
        >
          Add Widget
        </Button>
      </div>
      
      <Row gutter={24}>
        {activeWidgets.map((widgetKey, index) => {
          const component = getWidgetComponent(widgetKey);
          if (!component) return null;
          
          return (
            <Col key={widgetKey} {...getColProps(widgetKey)}>
              <motion.div
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                {component}
              </motion.div>
            </Col>
          );
        })}
      </Row>

      <DashboardWidgetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onWidgetAdd={handleWidgetAdd}
      />
    </>
  );
};

export default DashboardWidgets;
import React, { useState, useMemo } from 'react';
import { Drawer, Tabs, Card, Row, Col, Typography, Button, Space, Input } from 'antd';
import { PlusOutlined, BarChartOutlined, SettingOutlined, AppstoreOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DashboardWidgetDrawerProps {
  open: boolean;
  onClose: () => void;
  onWidgetAdd: (widgetKey: string, category: string) => void;
}

interface WidgetItem {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  preview?: string;
}

const DashboardWidgetDrawer: React.FC<DashboardWidgetDrawerProps> = ({
  open,
  onClose,
  onWidgetAdd,
}) => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [searchText, setSearchText] = useState('');

  const widgetCategories = {
    monitoring: {
      title: 'Monitoring & Analytics',
      icon: <BarChartOutlined />,
      description: 'Real-time metrics and performance data',
      widgets: [
        {
          key: 'SystemPerformanceCard',
          title: 'System Performance',
          description: 'CPU/Memory monitoring with trend analysis',
          icon: <BarChartOutlined />,
          preview: 'Real-time performance metrics'
        },
        {
          key: 'AvailabilityCard',
          title: 'System Availability',
          description: 'Uptime tracking with monthly comparisons',
          icon: <BarChartOutlined />,
          preview: 'Availability percentage display'
        },
        {
          key: 'ContainersCard',
          title: 'Containers Status',
          description: 'Container metrics and usage statistics',
          icon: <BarChartOutlined />,
          preview: 'Running containers overview'
        },
        {
          key: 'CombinedPowerCard',
          title: 'Combined Power',
          description: 'Aggregated device CPU/Memory resources',
          icon: <BarChartOutlined />,
          preview: 'Resource distribution chart'
        },
        {
          key: 'MainChartCard',
          title: 'Historical Analytics',
          description: 'Time-series charts with device filtering',
          icon: <BarChartOutlined />,
          preview: 'Advanced analytics dashboard'
        }
      ] as WidgetItem[]
    },
    operations: {
      title: 'Operations & Management',
      icon: <SettingOutlined />,
      description: 'System management and operational tasks',
      widgets: [
        {
          key: 'AnsiblePlaybookRunner',
          title: 'Ansible Playbook Runner',
          description: 'Execute playbooks with progress tracking',
          icon: <SettingOutlined />,
          preview: 'Automated task execution'
        },
        {
          key: 'ContainerUpdateCenter',
          title: 'Container Update Center',
          description: 'Manage container updates and security alerts',
          icon: <SettingOutlined />,
          preview: 'Container lifecycle management'
        },
        {
          key: 'MaintenanceCalendar',
          title: 'Maintenance Calendar',
          description: 'Schedule and track maintenance tasks',
          icon: <SettingOutlined />,
          preview: 'Calendar-based task planning'
        },
        {
          key: 'QuickActionsWidget',
          title: 'Quick Actions',
          description: 'Customizable action buttons for common tasks',
          icon: <SettingOutlined />,
          preview: 'One-click operations panel'
        }
      ] as WidgetItem[]
    },
    productivity: {
      title: 'Productivity & Integration',
      icon: <AppstoreOutlined />,
      description: 'Notes, feeds, and external tool integration',
      widgets: [
        {
          key: 'NotebookWidget',
          title: 'Notebook/Notes',
          description: 'Markdown-based note-taking and documentation',
          icon: <AppstoreOutlined />,
          preview: 'Rich text documentation'
        },
        {
          key: 'RSSFeedWidget',
          title: 'RSS/News Feed',
          description: 'Aggregate news feeds from multiple sources',
          icon: <AppstoreOutlined />,
          preview: 'Latest industry updates'
        },
        {
          key: 'IFrameWidget',
          title: 'iFrame Embed',
          description: 'Embed external monitoring tools and dashboards',
          icon: <AppstoreOutlined />,
          preview: 'External tool integration'
        }
      ] as WidgetItem[]
    }
  };

  // Filter widgets based on search text
  const getFilteredWidgets = (widgets: WidgetItem[]) => {
    if (!searchText.trim()) {
      return widgets;
    }
    
    const searchLower = searchText.toLowerCase();
    return widgets.filter(widget => 
      widget.title.toLowerCase().includes(searchLower) ||
      widget.description.toLowerCase().includes(searchLower) ||
      (widget.preview && widget.preview.toLowerCase().includes(searchLower))
    );
  };

  const handleWidgetAdd = (widgetKey: string) => {
    onWidgetAdd(widgetKey, activeTab);
    setSearchText(''); // Clear search on widget add
    onClose();
  };

  const handleClose = () => {
    setSearchText(''); // Clear search on drawer close
    onClose();
  };

  const renderWidgetCard = (widget: WidgetItem) => (
    <Col xs={24} sm={12} lg={8} key={widget.key}>
      <Card
        hoverable
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: '#333',
          height: '160px',
          display: 'flex',
          flexDirection: 'column'
        }}
        bodyStyle={{ 
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <Space align="start" style={{ width: '100%', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px', color: '#1890ff' }}>
              {widget.icon}
            </span>
            <Title level={5} style={{ margin: 0, color: '#fff', fontSize: '14px' }}>
              {widget.title}
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            {widget.description}
          </Text>
          <Text style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
            {widget.preview}
          </Text>
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleWidgetAdd(widget.key)}
          style={{ alignSelf: 'flex-end', marginTop: '8px' }}
        >
          Add Widget
        </Button>
      </Card>
    </Col>
  );

  // Calculate total matches across all categories
  const totalMatches = useMemo(() => {
    if (!searchText.trim()) return null;
    
    return Object.values(widgetCategories).reduce((total, category) => {
      return total + getFilteredWidgets(category.widgets).length;
    }, 0);
  }, [searchText]);

  const tabItems = Object.entries(widgetCategories).map(([key, category]) => {
    const filteredWidgets = getFilteredWidgets(category.widgets);
    
    return {
      key,
      label: (
        <Space>
          {category.icon}
          <span>{category.title}</span>
          {searchText && (
            <span style={{ color: '#888', fontSize: '12px' }}>
              ({filteredWidgets.length})
            </span>
          )}
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <Title level={4} style={{ color: '#fff', margin: 0, fontSize: '16px' }}>
              {category.title}
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {category.description}
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            {filteredWidgets.length > 0 ? (
              filteredWidgets.map(renderWidgetCard)
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">
                    No widgets found matching "{searchText}"
                  </Text>
                </div>
              </Col>
            )}
          </Row>
        </div>
      )
    };
  });

  return (
    <Drawer
      title={
        <Space>
          <AppstoreOutlined />
          <span>Add Dashboard Widget</span>
        </Space>
      }
      placement="right"
      width={720}
      onClose={handleClose}
      open={open}
      styles={{
        body: { backgroundColor: '#0a0a0a', padding: 0 },
        header: { backgroundColor: '#1a1a1a', borderBottom: '1px solid #333' }
      }}
    >
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid #333' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search widgets by name or description..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            backgroundColor: '#1a1a1a',
            borderColor: '#333'
          }}
          allowClear
          size="large"
        />
        {searchText && totalMatches !== null && (
          <div style={{ marginTop: '8px', marginBottom: '16px' }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Found {totalMatches} widget{totalMatches !== 1 ? 's' : ''} matching "{searchText}"
            </Text>
          </div>
        )}
        {!searchText && (
          <div style={{ marginBottom: '16px' }} />
        )}
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ height: '100%' }}
        tabBarStyle={{
          margin: '0 24px',
          borderBottom: '1px solid #333'
        }}
      />
    </Drawer>
  );
};

export default DashboardWidgetDrawer;
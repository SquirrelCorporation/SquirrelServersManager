/**
 * Widget Gallery Component
 * Displays available widgets for adding to the dashboard
 */

import React from 'react';
import { Space, Card, Tooltip, Tabs } from 'antd';
import { DashboardOutlined, ToolOutlined } from '@ant-design/icons';
import { DashboardItem } from './types';

interface WidgetGalleryProps {
  availableItems: DashboardItem[];
  onAddWidget: (item: DashboardItem) => void;
}

const WidgetGallery: React.FC<WidgetGalleryProps> = ({ availableItems, onAddWidget }) => {
  const renderWidgetCard = (item: DashboardItem) => (
    <Card 
      key={item.id}
      hoverable
      size="small"
      title={item.title}
      onClick={() => onAddWidget({...item, id: `${item.id}-${Date.now()}`})}
      style={{ marginBottom: 16, cursor: 'pointer' }}
      extra={
        <Tooltip title={`Size: ${item.size}`}>
          <span style={{ 
            fontSize: 10, 
            padding: '2px 6px', 
            background: '#f0f0f0', 
            borderRadius: 2,
            color: '#666'
          }}>
            {item.size.toUpperCase()}
          </span>
        </Tooltip>
      }
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ 
        height: '100px', 
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 4
      }}>
        <div style={{
          transform: 'scale(0.25)',
          transformOrigin: 'top left',
          width: '400%',
          pointerEvents: 'none'
        }}>
          {/* For preview mode, if the item has a componentFactory, use it with isPreview flag */}
          {(() => {
            if (item.componentFactory) {
              return item.componentFactory({ isPreview: true });
            }
            return item.component;
          })()}
        </div>
      </div>
    </Card>
  );

  const monitoringWidgets = availableItems.filter(item => {
    // Monitoring category includes system status widgets and charts
    const monitoringIds = ['SystemPerformanceCard', 'AvailabilityCard', 'ContainersCard', 'CombinedPowerCard', 'MainChartCard'];
    const chartIds = [
      'single-number-variation', 'medium-graph', 'progress-lines-graph', 
      'percentage', 'ring-progress', 'single-number-card-variation',
      'pie-chart', 'website-visits', 'single-number-variation-popover',
      'total-downloads', 'area-chart'
    ];
    return item.category === 'monitoring' || item.category === 'charts' || 
           monitoringIds.includes(item.id) || chartIds.includes(item.id);
  });

  const toolWidgets = availableItems.filter(item => {
    // Tools category includes productivity and management widgets
    const toolIds = [
      'welcome-header', 'tips-of-the-day', 'AnsiblePlaybookRunner',
      'ContainerUpdateCenter', 'MaintenanceCalendar', 'QuickActionsWidget',
      'NotebookWidget', 'RSSFeedWidget', 'IFrameWidget'
    ];
    return item.category === 'tools' || toolIds.includes(item.id);
  });

  return (
    <Tabs
      defaultActiveKey="monitoring"
      items={[
        {
          key: 'monitoring',
          label: (
            <span>
              <DashboardOutlined style={{ marginRight: 8 }} />
              Monitoring
            </span>
          ),
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              {monitoringWidgets.map(renderWidgetCard)}
            </Space>
          ),
        },
        {
          key: 'tools',
          label: (
            <span>
              <ToolOutlined style={{ marginRight: 8 }} />
              Tools & Utilities
            </span>
          ),
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              {toolWidgets.map(renderWidgetCard)}
            </Space>
          ),
        },
      ]}
    />
  );
};

export default WidgetGallery;
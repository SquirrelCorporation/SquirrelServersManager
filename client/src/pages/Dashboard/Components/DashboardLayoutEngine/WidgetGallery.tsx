/**
 * Widget Gallery Component
 * Displays available widgets for adding to the dashboard
 */

import React, { useState } from 'react';
import { Space, Card, Tooltip, Tabs, Button, Radio } from 'antd';
import { DashboardOutlined, ToolOutlined, AppstoreOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import { DashboardItem, DashboardItemSize } from './types';

interface WidgetGalleryProps {
  availableItems: DashboardItem[];
  onAddWidget: (item: DashboardItem) => void;
}

const WidgetGallery: React.FC<WidgetGalleryProps> = ({ availableItems, onAddWidget }) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, DashboardItemSize>>({});

  // Define which widgets support multiple sizes
  const sizeSupportMap: Record<string, DashboardItemSize[]> = {
    // Monitoring widgets that can be small or medium
    'single-number-variation': ['small', 'medium'],
    'percentage': ['small', 'medium'],
    'ring-progress': ['small', 'medium'],
    'compact-stat-card': ['small', 'medium'],
    'total-downloads': ['small', 'medium'],
    
    // Charts that can be medium or large
    'medium-graph': ['medium', 'two-thirds', 'large'],  // LineChart can be 2, 3, or 4 columns
    'pie-chart': ['medium', 'large'],
    'area-chart': ['medium', 'large'],
    'line-gradient': ['medium', 'large'],
    'website-visits': ['medium', 'large'],
    'progress-bars': ['medium', 'large'],
    
    // Tools that are flexible
    'RSSFeedWidget': ['small', 'medium', 'large'],
    'IFrameWidget': ['small', 'medium', 'large'],
    'NotebookWidget': ['medium', 'large'],
    'AnsiblePlaybookRunner': ['two-thirds', 'large'],
    'ContainerUpdateCenter': ['two-thirds', 'large'],
  };

  const renderWidgetCard = (item: DashboardItem) => {
    const supportedSizes = sizeSupportMap[item.id] || [item.size];
    const selectedSize = selectedSizes[item.id] || item.size;
    const showSizeSelector = supportedSizes.length > 1;
    
    return (
      <Card 
        key={item.id}
        hoverable
        size="small"
        title={item.title}
        style={{ marginBottom: 16 }}
        extra={
          <Tooltip title={`Size: ${selectedSize}`}>
            <span style={{ 
              fontSize: 10, 
              padding: '2px 6px', 
              background: '#f0f0f0', 
              borderRadius: 2,
              color: '#666'
            }}>
              {selectedSize.toUpperCase()}
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
      {showSizeSelector && (
        <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
            <ColumnWidthOutlined /> Choose size:
          </div>
          <Radio.Group 
            value={selectedSize} 
            onChange={(e) => setSelectedSizes({ ...selectedSizes, [item.id]: e.target.value })}
            size="small"
            style={{ width: '100%' }}
          >
            <Space direction="horizontal" style={{ width: '100%' }}>
              {supportedSizes.map(size => (
                <Radio.Button key={size} value={size}>
                  {size === 'small' ? '1 Col' : 
                   size === 'medium' ? '2 Cols' : 
                   size === 'two-thirds' ? '3 Cols' : 
                   size === 'medium-large' ? '3 Cols' : '4 Cols'}
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
          <Button 
            type="primary" 
            size="small" 
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => onAddWidget({...item, id: `${item.id}-${Date.now()}`, size: selectedSize})}
          >
            Add Widget
          </Button>
        </div>
      )}
      {!showSizeSelector && (
        <Button 
          type="primary" 
          size="small" 
          style={{ marginTop: 8, width: '100%' }}
          onClick={() => onAddWidget({...item, id: `${item.id}-${Date.now()}`})}
        >
          Add Widget
        </Button>
      )}
    </Card>
    );
  };

  const presetWidgets = availableItems.filter(item => {
    // Preset category includes pre-configured system monitoring widgets
    const presetIds = ['SystemPerformanceCard', 'AvailabilityCard', 'ContainersCard', 'CombinedPowerCard', 'MainChartCard'];
    return item.category === 'presets' || presetIds.includes(item.id);
  });

  const monitoringWidgets = availableItems.filter(item => {
    // Monitoring category includes customizable status widgets and charts
    const chartIds = [
      'single-number-variation', 'medium-graph', 
      'percentage', 'ring-progress', 'compact-stat-card',
      'pie-chart', 'website-visits', 'progress-bars',
      'total-downloads', 'area-chart', 'line-gradient'
    ];
    // Exclude preset IDs from monitoring category
    const presetIds = ['SystemPerformanceCard', 'AvailabilityCard', 'ContainersCard', 'CombinedPowerCard', 'MainChartCard'];
    return (item.category === 'monitoring' || item.category === 'charts' || chartIds.includes(item.id)) 
           && !presetIds.includes(item.id);
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
      defaultActiveKey="presets"
      items={[
        {
          key: 'presets',
          label: (
            <span>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Presets
            </span>
          ),
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              {presetWidgets.map(renderWidgetCard)}
            </Space>
          ),
        },
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
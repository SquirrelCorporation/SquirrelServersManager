/**
 * Automation List Component
 * Displays automations in various view modes (grid, list, table)
 */

import React, { useState } from 'react';
import {
  Row,
  Col,
  List,
  Table,
  Input,
  Select,
  Space,
  Button,
  Radio,
  Card,
  Statistic,
  Empty,
  Spin,
  Alert,
  Tag,
} from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  TableOutlined,
  PlusOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAutomationList, useAutomationOperations, useBulkAutomationOperations } from '../model/hooks';
import { useGlobalAutomationEvents } from '@/shared/lib/websocket/automation-hooks';
import { AutomationCard } from './AutomationCard';
import { getExecutionStatusInfo, getTimeSinceLastExecution } from '@/shared/lib/automations';
import type { API } from 'ssm-shared-lib';

const { Search } = Input;
const { Option } = Select;

type ViewMode = 'grid' | 'list' | 'table';

interface AutomationListProps {
  onCreateNew?: () => void;
  onEdit?: (automation: API.Automation) => void;
  onDelete?: (automation: API.Automation) => void;
  onExecute?: (automation: API.Automation) => void;
}

export const AutomationList: React.FC<AutomationListProps> = ({
  onCreateNew,
  onEdit,
  onDelete,
  onExecute,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);

  const {
    automations,
    stats,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useAutomationList();

  const { executeAutomation, isExecuting } = useAutomationOperations();
  const bulkOperations = useBulkAutomationOperations();
  const { isConnected } = useGlobalAutomationEvents();

  const handleExecute = async (automation: API.Automation) => {
    try {
      await executeAutomation(automation);
    } catch (error) {
      console.error('Failed to execute automation:', error);
    }
  };

  const renderStatsCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Total Automations"
            value={stats.total}
            prefix={<AppstoreOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Enabled"
            value={stats.enabled}
            valueStyle={{ color: '#3f8600' }}
            prefix={<PlayCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Success Rate"
            value={stats.successRate}
            precision={1}
            suffix="%"
            valueStyle={{ 
              color: stats.successRate >= 80 ? '#3f8600' : stats.successRate >= 60 ? '#faad14' : '#cf1322' 
            }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Failed"
            value={stats.failed}
            valueStyle={{ color: stats.failed > 0 ? '#cf1322' : '#3f8600' }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderFilters = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={setSearchTerm}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '100%' }}
            placeholder="Status"
          >
            <Option value="all">All Status</Option>
            <Option value="enabled">Enabled</Option>
            <Option value="disabled">Disabled</Option>
          </Select>
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: '100%' }}
            placeholder="Sort by"
          >
            <Option value="name">Name</Option>
            <Option value="lastExecution">Last Execution</Option>
            <Option value="status">Status</Option>
          </Select>
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            style={{ width: '100%' }}
          >
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <Radio.Button value="grid">
              <AppstoreOutlined />
            </Radio.Button>
            <Radio.Button value="list">
              <BarsOutlined />
            </Radio.Button>
            <Radio.Button value="table">
              <TableOutlined />
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      
      {bulkOperations.hasSelection && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Space>
              <Tag color="blue">{bulkOperations.selectionCount} selected</Tag>
              <Button
                size="small"
                onClick={() => bulkOperations.executeSelected(automations)}
                disabled={isExecuting}
              >
                Execute Selected
              </Button>
              <Button
                size="small"
                danger
                onClick={() => bulkOperations.deleteSelected(automations)}
              >
                Delete Selected
              </Button>
              <Button size="small" onClick={bulkOperations.clearSelection}>
                Clear Selection
              </Button>
            </Space>
          </Col>
        </Row>
      )}
    </Card>
  );

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {automations.map((automation) => (
        <Col key={automation.uuid} xs={24} sm={12} lg={8} xl={6}>
          <AutomationCard
            automation={automation}
            isSelected={selectedAutomation === automation.uuid}
            onSelect={() => setSelectedAutomation(
              selectedAutomation === automation.uuid ? null : automation.uuid
            )}
            onEdit={onEdit}
            onDelete={onDelete}
            onExecute={handleExecute}
          />
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={automations}
      renderItem={(automation) => (
        <List.Item
          actions={[
            <Button
              key="execute"
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecute(automation)}
              disabled={!automation.enabled || isExecuting}
            />,
            <Button
              key="edit"
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(automation)}
            />,
            <Button
              key="delete"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(automation)}
            />,
          ]}
        >
          <List.Item.Meta
            title={
              <Space>
                {automation.name}
                <Tag color={automation.enabled ? 'green' : 'red'}>
                  {automation.enabled ? 'Enabled' : 'Disabled'}
                </Tag>
                <Tag color={getExecutionStatusInfo(automation.lastExecutionStatus).color}>
                  {automation.lastExecutionStatus}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical">
                <Space size="small">
                  <span>Actions: {automation.automationChains.actions.length}</span>
                  <span>•</span>
                  <span>Last run: {getTimeSinceLastExecution(automation.lastExecutionTime)}</span>
                </Space>
                {automation.automationChains.trigger === 'cron' && (
                  <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>
                    {automation.automationChains.cronValue}
                  </code>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderTableView = () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: API.Automation, b: API.Automation) => a.name.localeCompare(b.name),
      },
      {
        title: 'Status',
        key: 'status',
        render: (automation: API.Automation) => (
          <Space>
            <Tag color={automation.enabled ? 'green' : 'red'}>
              {automation.enabled ? 'Enabled' : 'Disabled'}
            </Tag>
            <Tag color={getExecutionStatusInfo(automation.lastExecutionStatus).color}>
              {automation.lastExecutionStatus}
            </Tag>
          </Space>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (automation: API.Automation) => (
          <span>{automation.automationChains.actions.length}</span>
        ),
      },
      {
        title: 'Last Execution',
        key: 'lastExecution',
        render: (automation: API.Automation) => (
          getTimeSinceLastExecution(automation.lastExecutionTime)
        ),
        sorter: (a: API.Automation, b: API.Automation) => {
          const aTime = a.lastExecutionTime ? new Date(a.lastExecutionTime).getTime() : 0;
          const bTime = b.lastExecutionTime ? new Date(b.lastExecutionTime).getTime() : 0;
          return aTime - bTime;
        },
      },
      {
        title: 'Actions',
        key: 'operations',
        render: (automation: API.Automation) => (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecute(automation)}
              disabled={!automation.enabled || isExecuting}
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(automation)}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(automation)}
            />
          </Space>
        ),
      },
    ];

    return (
      <Table
        dataSource={automations}
        columns={columns}
        rowKey="uuid"
        rowSelection={{
          selectedRowKeys: bulkOperations.selectedAutomations,
          onChange: (selectedRowKeys) => {
            // Update bulk selection
            bulkOperations.clearSelection();
            selectedRowKeys.forEach(key => bulkOperations.selectAutomation(key as string));
          },
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} automations`,
        }}
      />
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert
          message="Error Loading Automations"
          description={error.message}
          type="error"
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      );
    }

    if (automations.length === 0 && !isLoading) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            searchTerm ? 'No automations match your search' : 'No automations found'
          }
          style={{ margin: '48px 0' }}
        >
          {!searchTerm && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
              Create Your First Automation
            </Button>
          )}
        </Empty>
      );
    }

    switch (viewMode) {
      case 'grid':
        return renderGridView();
      case 'list':
        return renderListView();
      case 'table':
        return renderTableView();
      default:
        return renderGridView();
    }
  };

  return (
    <div>
      {!isConnected && (
        <Alert
          message="Real-time Updates Unavailable"
          description="WebSocket connection is down. Automation status may not be current."
          type="warning"
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      {renderStatsCards()}
      
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <span />
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateNew}
          >
            New Automation
          </Button>
        </Space>
      </Space>
      
      {renderFilters()}
      
      <Spin spinning={isLoading}>
        {renderContent()}
      </Spin>
    </div>
  );
};
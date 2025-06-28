import React from 'react';
import { Drawer, Form, Select, Switch, Space, Button, Divider, Typography } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { Device } from '@shared/store/device-store';
import { ImageFilters } from '../../../model/images-store';

const { Text } = Typography;

interface ImageFiltersDrawerProps {
  visible: boolean;
  onClose: () => void;
  filters: ImageFilters;
  onFiltersChange: (filters: Partial<ImageFilters>) => void;
  devices: Device[];
}

export const ImageFiltersDrawer: React.FC<ImageFiltersDrawerProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  devices,
}) => {
  const [form] = Form.useForm();

  const handleApplyFilters = (values: any) => {
    onFiltersChange(values);
    onClose();
  };

  const handleClearFilters = () => {
    form.resetFields();
    onFiltersChange({});
    onClose();
  };

  const deviceOptions = devices.map(device => ({
    label: `${device.name} (${device.ip})`,
    value: device.uuid,
  }));

  const usageOptions = [
    { label: 'All Images', value: undefined },
    { label: 'In Use Only', value: true },
    { label: 'Unused Only', value: false },
  ];

  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue(filters);
    }
  }, [visible, filters, form]);

  return (
    <Drawer
      title="Filter Images"
      placement="right"
      width={400}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
          >
            Apply Filters
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleApplyFilters}
        initialValues={filters}
      >
        {/* Device Filter */}
        <Form.Item
          label="Device"
          name="deviceUuid"
          tooltip="Filter images by specific device"
        >
          <Select
            placeholder="All devices"
            options={deviceOptions}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Divider />

        {/* Repository Filter */}
        <Form.Item
          label="Repository"
          name="repository"
          tooltip="Filter by repository name (partial match)"
        >
          <Select
            mode="tags"
            placeholder="Enter repository names..."
            style={{ width: '100%' }}
            tokenSeparators={[',']}
            maxTagCount="responsive"
          />
        </Form.Item>

        {/* Tag Filter */}
        <Form.Item
          label="Tag"
          name="tag"
          tooltip="Filter by specific tag"
        >
          <Select
            mode="tags"
            placeholder="Enter tags..."
            style={{ width: '100%' }}
            tokenSeparators={[',']}
            maxTagCount="responsive"
          />
        </Form.Item>

        <Divider />

        {/* Usage Filter */}
        <Form.Item
          label="Usage Status"
          name="inUse"
          tooltip="Filter by whether images are currently in use by containers"
        >
          <Select
            placeholder="All images"
            options={usageOptions}
            allowClear
          />
        </Form.Item>

        {/* Additional Filters Section */}
        <Divider>
          <Text type="secondary">Advanced Filters</Text>
        </Divider>

        <div style={{ 
          background: '#f6f8fa', 
          padding: 16, 
          borderRadius: 6,
          border: '1px solid #e1e4e8'
        }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            <strong>Filter Summary:</strong>
            <br />
            • Repository: Matches images containing the specified text
            <br />
            • Tag: Exact tag match (supports multiple tags)
            <br />
            • Usage: Shows only images that are/aren't used by containers
            <br />
            • Device: Limits results to specific device
          </Text>
        </div>

        {/* Filter Statistics */}
        {Object.keys(filters).length > 0 && (
          <div style={{ 
            marginTop: 16,
            padding: 12,
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: 4
          }}>
            <Text strong style={{ color: '#0050b3' }}>
              Active Filters: {Object.keys(filters).filter(key => filters[key as keyof ImageFilters] !== undefined).length}
            </Text>
            <div style={{ marginTop: 8, fontSize: '12px' }}>
              {filters.deviceUuid && (
                <div>• Device: {devices.find(d => d.uuid === filters.deviceUuid)?.name || 'Selected'}</div>
              )}
              {filters.repository && (
                <div>• Repository: {filters.repository}</div>
              )}
              {filters.tag && (
                <div>• Tag: {filters.tag}</div>
              )}
              {filters.inUse !== undefined && (
                <div>• Usage: {filters.inUse ? 'In Use Only' : 'Unused Only'}</div>
              )}
              {filters.search && (
                <div>• Search: "{filters.search}"</div>
              )}
            </div>
          </div>
        )}
      </Form>
    </Drawer>
  );
};
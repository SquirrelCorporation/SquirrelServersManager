import React from 'react';
import { Drawer, Form, Select, Switch, Button, Space, Divider } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { VolumeFilters } from '../../../model/volumes-store';
import { Device } from '@shared/api/containers';

const { Option } = Select;

interface VolumeFiltersDrawerProps {
  visible: boolean;
  onClose: () => void;
  filters: VolumeFilters;
  onFiltersChange: (filters: Partial<VolumeFilters>) => void;
  devices: Device[];
}

export const VolumeFiltersDrawer: React.FC<VolumeFiltersDrawerProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  devices,
}) => {
  const [form] = Form.useForm();

  const handleApply = (values: any) => {
    // Convert form values to filters, removing empty values
    const newFilters: Partial<VolumeFilters> = {};
    
    if (values.deviceUuid) newFilters.deviceUuid = values.deviceUuid;
    if (values.driver) newFilters.driver = values.driver;
    if (values.inUse !== undefined) newFilters.inUse = values.inUse;

    onFiltersChange(newFilters);
    onClose();
  };

  const handleClear = () => {
    form.resetFields();
    onFiltersChange({});
    onClose();
  };

  const handleReset = () => {
    form.resetFields();
  };

  React.useEffect(() => {
    if (visible) {
      // Set form values when drawer opens
      form.setFieldsValue({
        deviceUuid: filters.deviceUuid,
        driver: filters.driver,
        inUse: filters.inUse,
      });
    }
  }, [visible, filters, form]);

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof VolumeFilters] !== undefined
  ).length;

  return (
    <Drawer
      title={
        <Space>
          <FilterOutlined />
          Volume Filters
          {activeFiltersCount > 0 && (
            <span style={{ 
              background: '#1890ff', 
              color: 'white', 
              borderRadius: '10px', 
              padding: '2px 8px', 
              fontSize: '12px' 
            }}>
              {activeFiltersCount}
            </span>
          )}
        </Space>
      }
      placement="right"
      open={visible}
      onClose={onClose}
      width={400}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Clear All
          </Button>
          <Space>
            <Button onClick={handleReset}>
              Reset
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              Apply Filters
            </Button>
          </Space>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleApply}
      >
        <Form.Item
          name="deviceUuid"
          label="Device"
          extra="Filter volumes by device"
        >
          <Select
            placeholder="Select device"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {devices.map(device => (
              <Option key={device.uuid} value={device.uuid}>
                {device.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="driver"
          label="Storage Driver"
          extra="Filter by volume storage driver"
        >
          <Select placeholder="Select driver" allowClear>
            <Option value="local">Local</Option>
            <Option value="nfs">NFS</Option>
            <Option value="overlay2">Overlay2</Option>
            <Option value="tmpfs">TMPFS</Option>
            <Option value="cifs">CIFS</Option>
            <Option value="rexray">RexRay</Option>
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item
          name="inUse"
          label="Usage Status"
          extra="Filter by volume usage status"
        >
          <Select placeholder="Select usage status" allowClear>
            <Option value={true}>In Use</Option>
            <Option value={false}>Unused</Option>
          </Select>
        </Form.Item>

        <div style={{ 
          background: '#f6f8fa', 
          padding: 12, 
          borderRadius: 6, 
          fontSize: '12px',
          color: '#666',
          marginTop: 24
        }}>
          <strong>Tip:</strong> Use the search bar above the table to search by volume name, 
          driver, or mountpoint. Combine with these filters for more precise results.
        </div>
      </Form>
    </Drawer>
  );
};
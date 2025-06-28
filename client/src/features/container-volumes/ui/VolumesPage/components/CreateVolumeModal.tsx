import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, message, Space, Divider } from 'antd';
import { PlusOutlined, HddOutlined } from '@ant-design/icons';
import { useCreateVolume } from '../../../model/volumes-queries';
import { VolumeCreateRequest } from '@shared/api/containers';

const { Option } = Select;
const { TextArea } = Input;

interface CreateVolumeModalProps {
  visible: boolean;
  onClose: () => void;
  deviceUuid?: string;
}

export const CreateVolumeModal: React.FC<CreateVolumeModalProps> = ({
  visible,
  onClose,
  deviceUuid,
}) => {
  const [form] = Form.useForm();
  const [advancedMode, setAdvancedMode] = useState(false);
  const createVolume = useCreateVolume();

  const handleSubmit = async (values: any) => {
    if (!deviceUuid) {
      message.error('No device selected');
      return;
    }

    try {
      const request: VolumeCreateRequest = {
        deviceUuid,
        name: values.name,
        driver: values.driver || 'local',
        labels: values.labels ? parseKeyValuePairs(values.labels) : undefined,
        options: values.options ? parseKeyValuePairs(values.options) : undefined,
      };

      await createVolume.mutateAsync(request);
      
      message.success(`Volume "${values.name}" created successfully`);
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Failed to create volume');
    }
  };

  const parseKeyValuePairs = (text: string): Record<string, string> => {
    const pairs: Record<string, string> = {};
    text.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key?.trim() && valueParts.length > 0) {
        pairs[key.trim()] = valueParts.join('=').trim();
      }
    });
    return pairs;
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const validateVolumeName = (_: any, value: string) => {
    if (!value) return Promise.reject('Volume name is required');
    
    // Docker volume name validation
    const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
    if (!validPattern.test(value)) {
      return Promise.reject('Volume name must start with alphanumeric character and contain only letters, numbers, underscores, periods, and hyphens');
    }
    
    if (value.length > 64) {
      return Promise.reject('Volume name must be 64 characters or less');
    }
    
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <Space>
          <HddOutlined />
          Create New Volume
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={createVolume.isLoading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          driver: 'local',
        }}
      >
        <Form.Item
          name="name"
          label="Volume Name"
          rules={[{ validator: validateVolumeName }]}
          extra="Must start with alphanumeric character, max 64 characters"
        >
          <Input
            placeholder="my-volume"
            prefix={<HddOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="driver"
          label="Driver"
          extra="Storage driver for the volume"
        >
          <Select>
            <Option value="local">Local</Option>
            <Option value="nfs">NFS</Option>
            <Option value="overlay2">Overlay2</Option>
            <Option value="tmpfs">TMPFS</Option>
          </Select>
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Switch
              checked={advancedMode}
              onChange={setAdvancedMode}
              size="small"
            />
            <span>Advanced Options</span>
          </Space>
        </div>

        {advancedMode && (
          <>
            <Divider orientation="left" plain>
              Advanced Configuration
            </Divider>

            <Form.Item
              name="labels"
              label="Labels"
              extra="One label per line in format: key=value"
            >
              <TextArea
                placeholder={`type=data
environment=production
project=myapp`}
                rows={4}
              />
            </Form.Item>

            <Form.Item
              name="options"
              label="Driver Options"
              extra="Driver-specific options, one per line in format: key=value"
            >
              <TextArea
                placeholder={`size=100m
uid=1000
device=/dev/sdb1`}
                rows={4}
              />
            </Form.Item>
          </>
        )}

        <div style={{ 
          background: '#f6f8fa', 
          padding: 12, 
          borderRadius: 6, 
          fontSize: '12px',
          color: '#666',
          marginTop: 16
        }}>
          <strong>Note:</strong> Volumes provide persistent storage for containers. 
          Data in volumes persists even when containers are removed.
        </div>
      </Form>
    </Modal>
  );
};
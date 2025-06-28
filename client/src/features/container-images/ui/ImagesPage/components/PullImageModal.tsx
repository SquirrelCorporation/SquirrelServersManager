import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, Space, Typography, message, Divider } from 'antd';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { usePullImage, useSearchImages } from '../../../model/images-queries';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface PullImageModalProps {
  visible: boolean;
  onClose: () => void;
  deviceUuid?: string;
}

interface PullFormData {
  repository: string;
  tag: string;
  registry?: string;
  useAuth: boolean;
  username?: string;
  password?: string;
}

export const PullImageModal: React.FC<PullImageModalProps> = ({
  visible,
  onClose,
  deviceUuid,
}) => {
  const [form] = Form.useForm<PullFormData>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const pullImage = usePullImage();
  const searchImages = useSearchImages();

  const handlePull = async (values: PullFormData) => {
    if (!deviceUuid) {
      message.error('No device selected');
      return;
    }

    try {
      await pullImage.mutateAsync({
        deviceUuid,
        repository: values.repository,
        tag: values.tag || 'latest',
        registry: values.registry,
        auth: values.useAuth ? {
          username: values.username!,
          password: values.password!,
        } : undefined,
      });

      message.success(`Image ${values.repository}:${values.tag || 'latest'} pull started`);
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Failed to pull image');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const results = await searchImages.mutateAsync({
        term: searchTerm,
        registry: form.getFieldValue('registry'),
      });
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      message.error('Failed to search images');
    }
  };

  const selectSearchResult = (result: any) => {
    form.setFieldsValue({
      repository: result.name,
      tag: 'latest',
    });
    setSearchResults([]);
    setSearchTerm('');
  };

  const registryOptions = [
    { label: 'Docker Hub (default)', value: '' },
    { label: 'GitHub Container Registry', value: 'ghcr.io' },
    { label: 'Google Container Registry', value: 'gcr.io' },
    { label: 'Amazon ECR', value: 'public.ecr.aws' },
    { label: 'Red Hat Quay', value: 'quay.io' },
  ];

  return (
    <Modal
      title="Pull Container Image"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={pullImage.isLoading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePull}
        initialValues={{
          tag: 'latest',
          useAuth: false,
          registry: '',
        }}
      >
        {/* Image Search */}
        <div style={{ marginBottom: 16 }}>
          <Text strong>Search Images (Optional)</Text>
          <Space.Compact style={{ width: '100%', marginTop: 8 }}>
            <Input
              placeholder="Search Docker Hub images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
            />
            <button
              type="button"
              onClick={handleSearch}
              style={{
                border: '1px solid #d9d9d9',
                background: '#fff',
                padding: '4px 15px',
                cursor: 'pointer',
              }}
            >
              <SearchOutlined />
            </button>
          </Space.Compact>

          {searchResults.length > 0 && (
            <div style={{ 
              marginTop: 8, 
              border: '1px solid #d9d9d9', 
              borderRadius: 4,
              maxHeight: 200,
              overflowY: 'auto'
            }}>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    ':hover': { backgroundColor: '#f5f5f5' }
                  }}
                  onClick={() => selectSearchResult(result)}
                >
                  <div style={{ fontWeight: 500 }}>{result.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {result.description || 'No description available'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                    ⭐ {result.stars} • {result.official ? 'Official' : 'Community'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Registry Selection */}
        <Form.Item
          label="Registry"
          name="registry"
          tooltip="Select the container registry to pull from"
        >
          <Select
            options={registryOptions}
            placeholder="Select registry"
          />
        </Form.Item>

        {/* Repository and Tag */}
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item
            label="Repository"
            name="repository"
            style={{ width: '70%' }}
            rules={[
              { required: true, message: 'Repository is required' },
              { 
                pattern: /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*$/,
                message: 'Invalid repository name format'
              }
            ]}
          >
            <Input placeholder="e.g., nginx, ubuntu, library/redis" />
          </Form.Item>
          <Form.Item
            label="Tag"
            name="tag"
            style={{ width: '30%' }}
          >
            <Input placeholder="latest" />
          </Form.Item>
        </Space.Compact>

        <div style={{ 
          background: '#f6f8fa', 
          padding: 12, 
          borderRadius: 4, 
          margin: '16px 0',
          border: '1px solid #e1e4e8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <Text strong>Examples:</Text>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            • <Text code>nginx:alpine</Text> - Official nginx with alpine base
            <br />
            • <Text code>postgres:13</Text> - PostgreSQL version 13
            <br />
            • <Text code>node:16-slim</Text> - Node.js 16 slim variant
          </div>
        </div>

        {/* Authentication */}
        <Form.Item
          name="useAuth"
          valuePropName="checked"
        >
          <Switch checkedChildren="Use Authentication" unCheckedChildren="No Authentication" />
        </Form.Item>

        <Form.Item dependencies={['useAuth']} noStyle>
          {({ getFieldValue }) => 
            getFieldValue('useAuth') && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    { required: true, message: 'Username is required when using authentication' }
                  ]}
                >
                  <Input placeholder="Registry username" />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Password is required when using authentication' }
                  ]}
                >
                  <Input.Password placeholder="Registry password or token" />
                </Form.Item>
              </Space>
            )
          }
        </Form.Item>

        {/* Help Text */}
        <div style={{ 
          background: '#fffbe6', 
          border: '1px solid #ffe58f', 
          padding: 12, 
          borderRadius: 4,
          marginTop: 16 
        }}>
          <Text style={{ fontSize: '12px', color: '#8c6e00' }}>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            The image will be pulled to the selected device. Large images may take several minutes to download.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};
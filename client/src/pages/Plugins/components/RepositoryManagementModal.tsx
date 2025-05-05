import {
  addCustomRepository,
  getCustomRepositories,
  removeCustomRepository,
} from '@/services/rest/plugin-store.service';
import { DeleteOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, List, message, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';

interface RepositoryManagementModalProps {
  open: boolean;
  onClose: () => void;
  onRepositoriesUpdate: () => void;
}

const RepositoryManagementModal: React.FC<RepositoryManagementModalProps> = ({
  open,
  onClose,
  onRepositoriesUpdate,
}) => {
  const [repositories, setRepositories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      fetchRepos();
    }
  }, [open]);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: repos } = await getCustomRepositories();
      setRepositories(repos);
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories.');
      message.error(err.message || 'Failed to load repositories.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    setLoading(true);
    try {
      const { data: updatedRepos } = await removeCustomRepository(urlToRemove);
      setRepositories(updatedRepos);
      message.success('Repository removed successfully.');
      onRepositoriesUpdate();
    } catch (err: any) {
      message.error(err.message || 'Failed to remove repository.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: { url: string }) => {
    setLoading(true);
    try {
      const { data: updatedRepos } = await addCustomRepository(values.url);
      setRepositories(updatedRepos);
      message.success('Repository added successfully.');
      form.resetFields();
      onRepositoriesUpdate();
    } catch (err: any) {
      message.error(err.message || 'Failed to add repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Manage Custom Repositories"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loading}>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <List
          header={<div>Current Custom Repositories</div>}
          bordered
          dataSource={repositories}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(item)}
                  danger
                  size="small"
                  type="text"
                />,
              ]}
            >
              {item}
            </List.Item>
          )}
          locale={{ emptyText: 'No custom repositories added.' }}
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="inline" onFinish={handleAdd}>
          <Form.Item
            name="url"
            rules={[
              { required: true, message: 'Please enter a repository URL' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
            style={{ flexGrow: 1 }}
          >
            <Input placeholder="https://.../repository.json" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Repository
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RepositoryManagementModal;

import {
  deleteAnsibleConfig,
  getAnsibleConfig,
  postAnsibleConfig,
  putAnsibleConfig,
} from '@/services/rest/ansible-config/ansible-config';
import {
  ActionType,
  EditableProTable,
  ProColumns,
  RequestData,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Spin, Switch } from 'antd';
import React, { useRef, useState } from 'react';

interface ConfigEntry {
  key: string;
  section: string;
  name: string;
  value: string;
  deactivated?: boolean;
  description?: string;
}

const fetchConfig = async (): Promise<Partial<RequestData<ConfigEntry>>> => {
  const response = await getAnsibleConfig();
  const data = Object.entries(response.data || {}).flatMap(
    ([section, pairs]) => {
      if (Object.entries(pairs).length === 0) {
        return [
          {
            key: `${section}-empty`,
            section,
            name: '',
            value: '',
            deactivated: false,
            description: '',
          },
        ];
      }
      return Object.entries(pairs).map(([key, obj]) => ({
        key,
        section,
        name: key,
        value: typeof obj === 'string' ? obj : obj.value,
        deactivated: typeof obj === 'object' ? obj.deactivated : false,
        description: typeof obj === 'object' ? obj.description : '',
      }));
    },
  );
  return { data, success: true };
};

const saveConfig = async (record: ConfigEntry, existingEntry: boolean) => {
  try {
    if (record.name.trim() === '') {
      message.error({ content: 'Key cannot be empty' });
      return false;
    }
    if (existingEntry) {
      await putAnsibleConfig({
        section: record.section,
        key: record.name,
        value: record.value || '',
        deactivated: record.deactivated || false,
        description: record.description || '',
      });
      message.success({ content: 'Configuration updated successfully' });
    } else {
      await postAnsibleConfig({
        section: record.section,
        key: record.name,
        value: record.value || '',
        deactivated: record.deactivated || false,
        description: record.description || '',
      });
      message.success({ content: 'Configuration added successfully' });
    }
    return true;
  } catch {
    message.error({ content: 'Error saving configuration' });
    return false;
  }
};

const deleteConfig = async (record: ConfigEntry) => {
  try {
    await deleteAnsibleConfig({ ...record, key: record.name });
    message.success({ content: 'Configuration deleted successfully' });
    return true;
  } catch {
    message.error({ content: 'Error deleting configuration' });
    return false;
  }
};

const switchToggle = async (record: ConfigEntry) => {
  try {
    const toggleDeactivated = !record.deactivated;
    await putAnsibleConfig({
      section: record.section,
      key: record.name,
      value: record.value || '',
      deactivated: toggleDeactivated,
      description: record.description || '',
    });
    message.success({ content: 'Configuration updated successfully' });
    return true;
  } catch {
    message.error({ content: 'Error updating configuration' });
    return false;
  }
};

const AnsibleConfiguration: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetch = async (): Promise<Partial<RequestData<ConfigEntry>>> => {
    setLoading(true);
    const { data, success } = await fetchConfig();
    setDataSource(data as ConfigEntry[]);
    setLoading(false);
    return { data, success };
  };

  const handleSave = async (record: ConfigEntry) => {
    const existing = record.key.indexOf('-') !== -1;
    setDataSource((prev) =>
      existing
        ? prev.map((item) => (item.key === record.key ? record : item))
        : [...prev, { ...record, key: `${Date.now()}` }],
    );
    setLoading(true);
    const success = await saveConfig(record, existing);
    setLoading(false);
    if (!success) {
      actionRef.current?.reload?.();
    } else {
      setEditableRowKeys([]);
    }
  };

  const handleDeleteConfig = async (record: ConfigEntry) => {
    setDataSource((prev) => prev.filter((item) => item.key !== record.key));
    setLoading(true);
    const success = await deleteConfig(record);
    setLoading(false);
    if (!success) {
      actionRef.current?.reload?.();
    } else {
      setEditableRowKeys([]);
    }
  };

  const handleToggleDeactivated = async (record: ConfigEntry) => {
    const updatedRecord = { ...record, deactivated: !record.deactivated };
    setDataSource((prev) =>
      prev.map((item) => (item.key === record.key ? updatedRecord : item)),
    );
    setLoading(true);
    const success = await switchToggle(record);
    setLoading(false);
    if (!success) {
      actionRef.current?.reload?.();
    }
  };

  const columns: ProColumns<ConfigEntry>[] = [
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      editable: false,
    },
    {
      title: 'Key',
      dataIndex: 'name',
      key: 'name',
      editable: false,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      editable: () => true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      editable: () => true,
      render: (dom, entity) =>
        entity.description
          ?.split('\n')
          .map((line, index) => <div key={index}>{line}</div>),
    },
    {
      title: 'Active',
      dataIndex: 'deactivated',
      key: 'deactivated',
      editable: false,
      render: (_, record: ConfigEntry) => (
        <Switch
          checked={!record.deactivated}
          onChange={() => handleToggleDeactivated(record)}
        />
      ),
    },
    {
      title: 'Actions',
      valueType: 'option',
      render: (_: any, record: ConfigEntry) => [
        <Button
          type="link"
          key={`${record.key}-editable`}
          onClick={() => {
            actionRef.current?.startEditable?.(record.key);
            setEditableRowKeys([record.key]);
          }}
        >
          Edit
        </Button>,
        <Popconfirm
          key={`${record.key}-delete`}
          title="Are you sure to delete this item?"
          onConfirm={() => handleDeleteConfig(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <Spin spinning={loading}>
      <EditableProTable<ConfigEntry>
        rowKey="key"
        search={false}
        actionRef={actionRef}
        columns={columns}
        value={dataSource}
        onChange={(config: readonly ConfigEntry[]) =>
          setDataSource(config as ConfigEntry[])
        }
        request={handleFetch}
        scroll={{ y: 250 }}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (_, record) => {
            await handleSave(record);
          },
          onChange: setEditableRowKeys,
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          creatorButtonText: 'Add a new configuration key',
          record: () => ({
            key: `${Date.now()}`,
            section: '',
            name: '',
            value: '',
          }),
          position: 'bottom',
        }}
        options={{ reload: true, density: false, fullScreen: true }}
      />
    </Spin>
  );
};

export default AnsibleConfiguration;

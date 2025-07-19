import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Row, Col, Modal, Input, Select, message, Badge } from 'antd';
import { 
  PlusOutlined, 
  PlayCircleOutlined, 
  StopOutlined, 
  ReloadOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  RocketOutlined,
  CodeOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  TerminalIcon
} from '@ant-design/icons';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  type: 'container' | 'playbook' | 'ssh' | 'command' | 'url';
  action: string; // container ID, playbook path, SSH command, etc.
  color: string;
  icon: string;
  target?: string; // for SSH actions
  enabled: boolean;
}

interface QuickActionsWidgetProps {
  title?: string;
  cardStyle?: React.CSSProperties;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  title = 'Quick Actions',
  cardStyle,
}) => {
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAction, setEditingAction] = useState<QuickAction | null>(null);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'container' as QuickAction['type'],
    action: '',
    color: '#4ecb71',
    icon: 'RocketOutlined',
    target: '',
    enabled: true,
  });

  const actionTypes = [
    { value: 'container', label: 'Container Action', icon: '🐳' },
    { value: 'playbook', label: 'Ansible Playbook', icon: '📋' },
    { value: 'ssh', label: 'SSH Command', icon: '🖥️' },
    { value: 'command', label: 'System Command', icon: '⚡' },
    { value: 'url', label: 'Open URL', icon: '🌐' },
  ];

  const colorOptions = [
    '#4ecb71', '#1890ff', '#faad14', '#ff4d4f', '#722ed1', 
    '#13c2c2', '#eb2f96', '#52c41a', '#f5222d', '#fa8c16'
  ];

  const iconOptions = [
    { value: 'RocketOutlined', icon: <RocketOutlined />, label: 'Rocket' },
    { value: 'PlayCircleOutlined', icon: <PlayCircleOutlined />, label: 'Play' },
    { value: 'CodeOutlined', icon: <CodeOutlined />, label: 'Code' },
    { value: 'GlobalOutlined', icon: <GlobalOutlined />, label: 'Global' },
    { value: 'DatabaseOutlined', icon: <DatabaseOutlined />, label: 'Database' },
    { value: 'SettingOutlined', icon: <SettingOutlined />, label: 'Settings' },
  ];

  // Default actions
  const defaultActions: QuickAction[] = [
    {
      id: 'restart-nginx',
      name: 'Restart Nginx',
      description: 'Restart the Nginx container',
      type: 'container',
      action: 'nginx_container_restart',
      color: '#4ecb71',
      icon: 'RocketOutlined',
      enabled: true,
    },
    {
      id: 'backup-db',
      name: 'Backup Database',
      description: 'Run database backup playbook',
      type: 'playbook',
      action: '/playbooks/backup-database.yml',
      color: '#1890ff',
      icon: 'DatabaseOutlined',
      enabled: true,
    },
    {
      id: 'check-disk',
      name: 'Check Disk Space',
      description: 'Check disk usage on all servers',
      type: 'ssh',
      action: 'df -h',
      color: '#faad14',
      icon: 'GlobalOutlined',
      target: 'all_servers',
      enabled: true,
    },
    {
      id: 'portainer',
      name: 'Open Portainer',
      description: 'Open Portainer in new tab',
      type: 'url',
      action: 'http://localhost:9000',
      color: '#722ed1',
      icon: 'CodeOutlined',
      enabled: true,
    },
  ];

  // Load actions from localStorage
  useEffect(() => {
    const savedActions = localStorage.getItem('ssm-quick-actions');
    if (savedActions) {
      try {
        setActions(JSON.parse(savedActions));
      } catch (error) {
        console.error('Failed to load quick actions:', error);
        setActions(defaultActions);
      }
    } else {
      setActions(defaultActions);
    }
  }, []);

  const saveActions = (updatedActions: QuickAction[]) => {
    localStorage.setItem('ssm-quick-actions', JSON.stringify(updatedActions));
    setActions(updatedActions);
  };

  const executeAction = async (action: QuickAction) => {
    if (executingActions.has(action.id)) return;

    setExecutingActions(prev => new Set(prev).add(action.id));

    try {
      switch (action.type) {
        case 'container':
          // Mock container action
          await new Promise(resolve => setTimeout(resolve, 2000));
          message.success(`Container action "${action.name}" executed successfully`);
          break;
          
        case 'playbook':
          // Mock playbook execution
          await new Promise(resolve => setTimeout(resolve, 3000));
          message.success(`Playbook "${action.name}" executed successfully`);
          break;
          
        case 'ssh':
          // Mock SSH command
          await new Promise(resolve => setTimeout(resolve, 1500));
          message.success(`SSH command "${action.name}" executed successfully`);
          break;
          
        case 'command':
          // Mock system command
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success(`Command "${action.name}" executed successfully`);
          break;
          
        case 'url':
          // Open URL in new tab
          window.open(action.action, '_blank');
          message.info(`Opened ${action.name} in new tab`);
          break;
          
        default:
          message.error('Unknown action type');
      }
    } catch (error) {
      console.error('Action execution failed:', error);
      message.error(`Failed to execute "${action.name}"`);
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.id);
        return newSet;
      });
    }
  };

  const openModal = (action?: QuickAction) => {
    if (action) {
      setEditingAction(action);
      setFormData({
        name: action.name,
        description: action.description,
        type: action.type,
        action: action.action,
        color: action.color,
        icon: action.icon,
        target: action.target || '',
        enabled: action.enabled,
      });
    } else {
      setEditingAction(null);
      setFormData({
        name: '',
        description: '',
        type: 'container',
        action: '',
        color: '#4ecb71',
        icon: 'RocketOutlined',
        target: '',
        enabled: true,
      });
    }
    setShowModal(true);
  };

  const saveAction = () => {
    if (!formData.name.trim() || !formData.action.trim()) {
      message.warning('Please fill in all required fields');
      return;
    }

    const newAction: QuickAction = {
      id: editingAction?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      action: formData.action.trim(),
      color: formData.color,
      icon: formData.icon,
      target: formData.target.trim(),
      enabled: formData.enabled,
    };

    if (editingAction) {
      saveActions(actions.map(action => action.id === editingAction.id ? newAction : action));
      message.success('Action updated');
    } else {
      saveActions([...actions, newAction]);
      message.success('Action created');
    }

    setShowModal(false);
  };

  const deleteAction = (id: string) => {
    saveActions(actions.filter(action => action.id !== id));
    message.success('Action deleted');
  };

  const toggleAction = (id: string) => {
    saveActions(actions.map(action => 
      action.id === id ? { ...action, enabled: !action.enabled } : action
    ));
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      RocketOutlined: <RocketOutlined />,
      PlayCircleOutlined: <PlayCircleOutlined />,
      CodeOutlined: <CodeOutlined />,
      GlobalOutlined: <GlobalOutlined />,
      DatabaseOutlined: <DatabaseOutlined />,
      SettingOutlined: <SettingOutlined />,
    };
    return iconMap[iconName] || <RocketOutlined />;
  };

  const enabledActions = actions.filter(action => action.enabled);

  return (
    <>
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          color: 'white',
          border: 'none',
          height: '400px',
          ...cardStyle,
        }}
        bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Space direction="horizontal" style={{ justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
          <Typography.Title
            level={4}
            style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            🎯 {title}
          </Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => openModal()}
            style={{
              backgroundColor: '#4ecb71',
              borderColor: '#4ecb71',
            }}
          >
            Add Action
          </Button>
        </Space>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {enabledActions.length > 0 ? (
            <Row gutter={[12, 12]}>
              {enabledActions.map((action) => (
                <Col span={12} key={action.id}>
                  <div style={{ position: 'relative' }}>
                    <Button
                      style={{
                        width: '100%',
                        height: '80px',
                        backgroundColor: action.color,
                        borderColor: action.color,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '12px',
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => executeAction(action)}
                      loading={executingActions.has(action.id)}
                      disabled={executingActions.has(action.id)}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                        {getIcon(action.icon)}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 500, textAlign: 'center', lineHeight: '1.2' }}>
                        {action.name}
                      </div>
                    </Button>
                    
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      display: 'flex',
                      gap: '2px',
                    }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(action);
                        }}
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          border: 'none',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#8c8c8c', 
              fontSize: '14px',
              marginTop: '60px'
            }}>
              🎯 No quick actions configured. Click "Add Action" to get started!
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '12px' }}>
            {enabledActions.length} of {actions.length} actions enabled
          </div>
        )}
      </Card>

      <Modal
        title={editingAction ? 'Edit Quick Action' : 'Create Quick Action'}
        open={showModal}
        onOk={saveAction}
        onCancel={() => setShowModal(false)}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Typography.Text strong>Name *</Typography.Text>
            <Input
              placeholder="Action name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Typography.Text strong>Description</Typography.Text>
            <Input.TextArea
              placeholder="What does this action do?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Typography.Text strong>Type *</Typography.Text>
            <Select
              style={{ width: '100%' }}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
              options={actionTypes.map(type => ({
                value: type.value,
                label: `${type.icon} ${type.label}`,
              }))}
            />
          </div>

          <div>
            <Typography.Text strong>
              {formData.type === 'container' ? 'Container Action' :
               formData.type === 'playbook' ? 'Playbook Path' :
               formData.type === 'ssh' ? 'SSH Command' :
               formData.type === 'command' ? 'System Command' :
               'URL'} *
            </Typography.Text>
            <Input
              placeholder={
                formData.type === 'container' ? 'container_name_action' :
                formData.type === 'playbook' ? '/path/to/playbook.yml' :
                formData.type === 'ssh' ? 'df -h' :
                formData.type === 'command' ? 'systemctl status docker' :
                'https://example.com'
              }
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            />
          </div>

          {formData.type === 'ssh' && (
            <div>
              <Typography.Text strong>Target</Typography.Text>
              <Input
                placeholder="server_group or specific_server"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              />
            </div>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Typography.Text strong>Color</Typography.Text>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {colorOptions.map(color => (
                  <div
                    key={color}
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: color,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: formData.color === color ? '2px solid white' : '1px solid #d9d9d9',
                    }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </Col>
            <Col span={12}>
              <Typography.Text strong>Icon</Typography.Text>
              <Select
                style={{ width: '100%' }}
                value={formData.icon}
                onChange={(value) => setFormData({ ...formData, icon: value })}
              >
                {iconOptions.map(icon => (
                  <Select.Option key={icon.value} value={icon.value}>
                    {icon.icon} {icon.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>

          {editingAction && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <Typography.Text>Enabled</Typography.Text>
              </div>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  deleteAction(editingAction.id);
                  setShowModal(false);
                }}
              >
                Delete Action
              </Button>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
};

export default QuickActionsWidget;
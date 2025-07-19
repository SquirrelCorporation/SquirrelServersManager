import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Space, Badge, Progress, Tooltip, Modal, Select, Input, message } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined, 
  HistoryOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { history } from '@umijs/max';

interface PlaybookExecution {
  id: string;
  playbookName: string;
  playbookPath: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  targetHosts: string[];
  output?: string;
  errorMessage?: string;
}

interface Playbook {
  name: string;
  path: string;
  description: string;
  tags: string[];
  estimatedDuration: number; // in minutes
  lastRun?: Date;
  runCount: number;
}

interface AnsiblePlaybookRunnerProps {
  title?: string;
  cardStyle?: React.CSSProperties;
}

const AnsiblePlaybookRunner: React.FC<AnsiblePlaybookRunnerProps> = ({
  title = 'Ansible Playbooks',
  cardStyle,
}) => {
  const [executions, setExecutions] = useState<PlaybookExecution[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock playbooks data
  const mockPlaybooks: Playbook[] = [
    {
      name: 'System Update',
      path: '/playbooks/system-update.yml',
      description: 'Update all packages on target systems',
      tags: ['maintenance', 'security'],
      estimatedDuration: 15,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      runCount: 23,
    },
    {
      name: 'Docker Cleanup',
      path: '/playbooks/docker-cleanup.yml',
      description: 'Clean up unused Docker images and containers',
      tags: ['docker', 'cleanup'],
      estimatedDuration: 5,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      runCount: 45,
    },
    {
      name: 'Security Hardening',
      path: '/playbooks/security-hardening.yml',
      description: 'Apply security configurations and updates',
      tags: ['security', 'hardening'],
      estimatedDuration: 30,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      runCount: 8,
    },
    {
      name: 'Backup Database',
      path: '/playbooks/backup-database.yml',
      description: 'Create database backups for all services',
      tags: ['backup', 'database'],
      estimatedDuration: 10,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      runCount: 67,
    },
    {
      name: 'Deploy Application',
      path: '/playbooks/deploy-app.yml',
      description: 'Deploy the latest application version',
      tags: ['deployment', 'application'],
      estimatedDuration: 8,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      runCount: 134,
    },
  ];

  // Mock host groups
  const hostGroups = [
    'all_servers',
    'web_servers',
    'database_servers',
    'monitoring_servers',
    'dev_servers',
    'prod_servers',
  ];

  useEffect(() => {
    setPlaybooks(mockPlaybooks);
    
    // Load execution history from localStorage
    const savedExecutions = localStorage.getItem('ssm-ansible-executions');
    if (savedExecutions) {
      try {
        const parsed = JSON.parse(savedExecutions).map((exec: any) => ({
          ...exec,
          startTime: new Date(exec.startTime),
          endTime: exec.endTime ? new Date(exec.endTime) : undefined,
        }));
        setExecutions(parsed);
      } catch (error) {
        console.error('Failed to load executions:', error);
      }
    }
  }, []);

  const saveExecutions = (executions: PlaybookExecution[]) => {
    localStorage.setItem('ssm-ansible-executions', JSON.stringify(executions));
    setExecutions(executions);
  };

  const runPlaybook = async (playbook: Playbook, hosts: string[]) => {
    if (hosts.length === 0) {
      message.warning('Please select target hosts');
      return;
    }

    const execution: PlaybookExecution = {
      id: Date.now().toString(),
      playbookName: playbook.name,
      playbookPath: playbook.path,
      status: 'queued',
      progress: 0,
      startTime: new Date(),
      targetHosts: hosts,
    };

    const updatedExecutions = [execution, ...executions];
    saveExecutions(updatedExecutions);

    setShowRunModal(false);
    setSelectedPlaybook(null);
    setSelectedHosts([]);

    // Simulate playbook execution
    setTimeout(() => {
      execution.status = 'running';
      saveExecutions([execution, ...executions]);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        execution.progress += Math.random() * 20;
        if (execution.progress >= 100) {
          execution.progress = 100;
          execution.status = Math.random() > 0.1 ? 'completed' : 'failed'; // 90% success rate
          execution.endTime = new Date();
          execution.duration = (execution.endTime.getTime() - execution.startTime.getTime()) / 1000;
          
          if (execution.status === 'failed') {
            execution.errorMessage = 'Task failed: Connection timeout on host web-server-02';
          }
          
          clearInterval(progressInterval);
          message[execution.status === 'completed' ? 'success' : 'error'](
            `Playbook "${playbook.name}" ${execution.status}`
          );
        }
        saveExecutions([execution, ...executions]);
      }, 1000);
    }, 2000);

    message.info(`Playbook "${playbook.name}" queued for execution`);
  };

  const openRunModal = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setSelectedHosts(['all_servers']);
    setShowRunModal(true);
  };

  const openPlaybookManagement = () => {
    history.push('/playbooks');
  };

  const getStatusIcon = (status: PlaybookExecution['status']) => {
    switch (status) {
      case 'running':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'queued':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getStatusColor = (status: PlaybookExecution['status']) => {
    switch (status) {
      case 'running': return '#1890ff';
      case 'completed': return '#52c41a';
      case 'failed': return '#ff4d4f';
      case 'queued': return '#faad14';
      default: return '#8c8c8c';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const runningExecutions = executions.filter(exec => exec.status === 'running' || exec.status === 'queued');
  const recentExecutions = executions.slice(0, 5);

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
        <Space direction="horizontal" style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
          <Typography.Title
            level={4}
            style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            🐿️ {title}
          </Typography.Title>
          <Space>
            <Tooltip title="View execution history">
              <Button
                type="text"
                icon={<HistoryOutlined />}
                size="small"
                onClick={() => setShowHistory(true)}
                style={{ color: '#8c8c8c' }}
              />
            </Tooltip>
            <Tooltip title="Manage playbooks">
              <Button
                type="text"
                icon={<SettingOutlined />}
                size="small"
                onClick={openPlaybookManagement}
                style={{ color: '#8c8c8c' }}
              />
            </Tooltip>
          </Space>
        </Space>

        {/* Running Executions */}
        {runningExecutions.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Currently Running ({runningExecutions.length})
            </Typography.Text>
            {runningExecutions.map((execution) => (
              <div key={execution.id} style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '8px',
                border: '1px solid #3a3a3a'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Space>
                    {getStatusIcon(execution.status)}
                    <Typography.Text style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500 }}>
                      {execution.playbookName}
                    </Typography.Text>
                  </Space>
                  <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px' }}>
                    {execution.targetHosts.join(', ')}
                  </Typography.Text>
                </div>
                {execution.status === 'running' && (
                  <Progress
                    percent={Math.round(execution.progress)}
                    size="small"
                    strokeColor={getStatusColor(execution.status)}
                    trailColor="rgba(255, 255, 255, 0.1)"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Run Playbooks */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            Quick Run
          </Typography.Text>
          <List
            dataSource={playbooks.slice(0, 4)}
            renderItem={(playbook) => (
              <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #3a3a3a' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <Typography.Text strong style={{ color: '#ffffff', fontSize: '13px', display: 'block' }}>
                        {playbook.name}
                      </Typography.Text>
                      <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px', lineHeight: '1.3' }}>
                        {playbook.description}
                      </Typography.Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      size="small"
                      onClick={() => openRunModal(playbook)}
                      style={{
                        backgroundColor: '#4ecb71',
                        borderColor: '#4ecb71',
                        marginLeft: '8px',
                      }}
                    >
                      Run
                    </Button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <Space size={4}>
                      {playbook.tags.slice(0, 2).map(tag => (
                        <Badge
                          key={tag}
                          count={tag}
                          style={{
                            backgroundColor: '#722ed1',
                            fontSize: '9px',
                            height: '14px',
                            lineHeight: '14px',
                            borderRadius: '7px',
                          }}
                        />
                      ))}
                    </Space>
                    <Typography.Text style={{ color: '#666', fontSize: '10px' }}>
                      Last run: {playbook.lastRun ? formatRelativeTime(playbook.lastRun) : 'Never'}
                    </Typography.Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
          {playbooks.length} playbooks available
        </div>
      </Card>

      {/* Run Playbook Modal */}
      <Modal
        title={`Run Playbook: ${selectedPlaybook?.name}`}
        open={showRunModal}
        onOk={() => selectedPlaybook && runPlaybook(selectedPlaybook, selectedHosts)}
        onCancel={() => setShowRunModal(false)}
        width={500}
      >
        {selectedPlaybook && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Typography.Text strong>Description:</Typography.Text>
              <Typography.Paragraph style={{ color: '#8c8c8c', marginBottom: 0 }}>
                {selectedPlaybook.description}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Text strong>Estimated Duration:</Typography.Text>
              <Typography.Text style={{ marginLeft: '8px', color: '#8c8c8c' }}>
                ~{selectedPlaybook.estimatedDuration} minutes
              </Typography.Text>
            </div>

            <div>
              <Typography.Text strong>Target Hosts: *</Typography.Text>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select target hosts"
                value={selectedHosts}
                onChange={setSelectedHosts}
                options={hostGroups.map(group => ({
                  value: group,
                  label: group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                }))}
              />
            </div>

            <div>
              <Typography.Text strong>Tags:</Typography.Text>
              <div style={{ marginTop: '4px' }}>
                {selectedPlaybook.tags.map(tag => (
                  <Badge
                    key={tag}
                    count={tag}
                    style={{
                      backgroundColor: '#722ed1',
                      marginRight: '4px',
                      fontSize: '10px',
                    }}
                  />
                ))}
              </div>
            </div>
          </Space>
        )}
      </Modal>

      {/* Execution History Modal */}
      <Modal
        title="Execution History"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}
        width={700}
      >
        <List
          dataSource={executions.slice(0, 20)}
          renderItem={(execution) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Space>
                    {getStatusIcon(execution.status)}
                    <Typography.Text strong>{execution.playbookName}</Typography.Text>
                    <Badge count={execution.status} style={{ backgroundColor: getStatusColor(execution.status) }} />
                  </Space>
                  <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    {execution.startTime.toLocaleString()}
                  </Typography.Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    Hosts: {execution.targetHosts.join(', ')}
                  </Typography.Text>
                  {execution.duration && (
                    <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                      Duration: {formatDuration(execution.duration)}
                    </Typography.Text>
                  )}
                </div>
                {execution.errorMessage && (
                  <Typography.Text style={{ color: '#ff4d4f', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Error: {execution.errorMessage}
                  </Typography.Text>
                )}
              </div>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default AnsiblePlaybookRunner;
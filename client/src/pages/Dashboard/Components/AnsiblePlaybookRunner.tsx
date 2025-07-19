import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Typography, List, Button, Space, Badge, Progress, Tooltip, Modal, Select, Input, message, Spin, Empty } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined, 
  HistoryOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { getPlaybooks } from '@/services/rest/playbooks/playbooks';
import { getAllDevices } from '@/services/rest/devices/devices';
import { API } from 'ssm-shared-lib';
import TerminalModal, { TerminalStateProps } from '@/components/PlaybookExecutionModal';
import {
  playbookExecutionEvents,
  PLAYBOOK_EXECUTION_START,
} from '@/components/HeaderComponents/PlaybookExecutionWidget';

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

import { WidgetConfiguration, PlaybookConfig } from '../Core/WidgetSettings.types';

interface AnsiblePlaybookRunnerProps {
  title?: string;
  cardStyle?: React.CSSProperties;
  configuration?: WidgetConfiguration;
  isPreview?: boolean;
}

const AnsiblePlaybookRunner: React.FC<AnsiblePlaybookRunnerProps> = ({
  title,
  cardStyle,
  configuration,
  isPreview = false,
}) => {
  // Extract settings from configuration
  const widgetTitle = configuration?.title as string || title || 'Ansible Playbooks';
  const playbookConfig = configuration?.playbooks as PlaybookConfig || { selectedPlaybooks: [] };
  const showTags = configuration?.showTags as boolean ?? true;
  const showDeviceCount = configuration?.showDeviceCount as boolean ?? true;
  const [loading, setLoading] = useState(false);
  const [playbooks, setPlaybooks] = useState<API.PlaybookFile[]>([]);
  const [devices, setDevices] = useState<API.DeviceItem[]>([]);
  const [terminalProps, setTerminalProps] = useState<TerminalStateProps>({
    isOpen: false,
  });

  // Fetch real playbooks and devices
  const fetchData = useCallback(async () => {
    if (isPreview) {
      // Use mock data in preview mode
      setPlaybooks([
        {
          uuid: '1',
          name: 'System Update',
          path: '/playbooks/system-update.yml',
          extraVars: [],
          quickRef: 'system-update',
        },
        {
          uuid: '2',
          name: 'Docker Cleanup',
          path: '/playbooks/docker-cleanup.yml',
          extraVars: [],
          quickRef: 'docker-cleanup',
        },
        {
          uuid: '3',
          name: 'Security Hardening',
          path: '/playbooks/security-hardening.yml',
          extraVars: [],
          quickRef: 'security-hardening',
        },
      ] as API.PlaybookFile[]);
      setDevices([
        { uuid: 'device-1', fqdn: 'server1.local', ip: '192.168.1.10' },
        { uuid: 'device-2', fqdn: 'server2.local', ip: '192.168.1.11' },
      ] as API.DeviceItem[]);
      return;
    }

    setLoading(true);
    try {
      // Fetch real data in parallel
      const [playbooksRes, devicesRes] = await Promise.all([
        getPlaybooks(),
        getAllDevices(),
      ]);
      
      setPlaybooks(playbooksRes.data || []);
      setDevices(devicesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load playbooks or devices');
    } finally {
      setLoading(false);
    }
  }, [isPreview]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter playbooks based on settings
  const filteredPlaybooks = useMemo(() => {
    if (playbookConfig.selectedPlaybooks.length === 0) {
      // If no playbooks selected in settings, show first 4
      return playbooks.slice(0, 4);
    }
    
    return playbooks.filter(playbook => 
      playbookConfig.selectedPlaybooks.some(selected => selected.uuid === playbook.uuid)
    );
  }, [playbooks, playbookConfig.selectedPlaybooks]);

  // Get device mapping for selected playbooks
  const getDevicesForPlaybook = useCallback((playbookUuid: string): API.DeviceItem[] => {
    const selectedPlaybook = playbookConfig.selectedPlaybooks.find(sp => sp.uuid === playbookUuid);
    if (!selectedPlaybook || selectedPlaybook.deviceUuids.length === 0) {
      return devices; // Return all devices if none specified
    }
    
    return devices.filter(device => 
      selectedPlaybook.deviceUuids.includes(device.uuid)
    );
  }, [playbookConfig.selectedPlaybooks, devices]);

  const runPlaybook = useCallback((playbook: API.PlaybookFile) => {
    const targetDevices = getDevicesForPlaybook(playbook.uuid);
    
    if (targetDevices.length === 0) {
      message.warning('No target devices configured for this playbook');
      return;
    }

    // Open terminal modal with playbook execution
    setTerminalProps({
      isOpen: true,
      command: playbook.path,
      playbookName: playbook.name,
      quickRef: playbook.quickRef,
      target: targetDevices,
      extraVars: playbook.extraVars?.reduce((acc, ev) => {
        acc[ev.extraVar] = ev.value;
        return acc;
      }, {} as API.ExtraVars),
    });
  }, [getDevicesForPlaybook]);

  const openPlaybookManagement = () => {
    history.push('/playbooks');
  };

  const getPlaybookDescription = (playbook: API.PlaybookFile): string => {
    // Generate description based on playbook name or quickRef
    const name = playbook.name.toLowerCase();
    if (name.includes('update')) return 'Update system packages and dependencies';
    if (name.includes('docker')) return 'Manage Docker containers and images';
    if (name.includes('security')) return 'Apply security configurations';
    if (name.includes('backup')) return 'Create backups of critical data';
    if (name.includes('deploy')) return 'Deploy application updates';
    if (name.includes('health')) return 'Check system health status';
    return 'Execute ansible playbook';
  };

  const getPlaybookTags = (playbook: API.PlaybookFile): string[] => {
    // Generate tags based on playbook name
    const name = playbook.name.toLowerCase();
    const tags: string[] = [];
    if (name.includes('update')) tags.push('maintenance', 'system');
    if (name.includes('docker')) tags.push('docker', 'containers');
    if (name.includes('security')) tags.push('security');
    if (name.includes('backup')) tags.push('backup', 'data');
    if (name.includes('deploy')) tags.push('deployment');
    if (name.includes('health')) tags.push('monitoring', 'health');
    if (tags.length === 0) tags.push('automation');
    return tags.slice(0, 2); // Max 2 tags
  };

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
            🎯 {widgetTitle}
          </Typography.Title>
          <Space>
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

        {/* Content */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        ) : filteredPlaybooks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Empty 
              description={
                <span style={{ color: '#8c8c8c' }}>
                  {playbooks.length === 0 
                    ? 'No playbooks available' 
                    : 'No playbooks configured. Click settings to add playbooks.'}
                </span>
              }
            />
          </div>
        ) : (
          <>
            {/* Quick Run Playbooks */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                Quick Run
              </Typography.Text>
              <List
                dataSource={filteredPlaybooks}
                renderItem={(playbook) => {
                  const targetDevices = getDevicesForPlaybook(playbook.uuid);
                  const description = getPlaybookDescription(playbook);
                  const tags = getPlaybookTags(playbook);
                  
                  return (
                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #3a3a3a' }}>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ flex: 1 }}>
                            <Typography.Text strong style={{ color: '#ffffff', fontSize: '13px', display: 'block' }}>
                              {playbook.name}
                            </Typography.Text>
                            <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px', lineHeight: '1.3' }}>
                              {description}
                            </Typography.Text>
                          </div>
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            size="small"
                            onClick={() => runPlaybook(playbook)}
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
                            {showTags && tags.map(tag => (
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
                          {showDeviceCount && (
                            <Typography.Text style={{ color: '#666', fontSize: '10px' }}>
                              Targets: {targetDevices.length} device{targetDevices.length !== 1 ? 's' : ''}
                            </Typography.Text>
                          )}
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>

            <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
              {playbooks.length} playbook{playbooks.length !== 1 ? 's' : ''} available
            </div>
          </>
        )}
      </Card>

      {/* Terminal Modal for Playbook Execution */}
      <TerminalModal
        terminalProps={{
          ...terminalProps,
          setIsOpen: (open) => setTerminalProps(prev => ({ ...prev, isOpen: open })),
        }}
      />
    </>
  );
};

export default AnsiblePlaybookRunner;
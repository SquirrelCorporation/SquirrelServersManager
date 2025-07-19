/**
 * Playbook Selector Component
 * Provides UI for selecting playbooks and their target devices
 */

import React, { useState, useEffect } from 'react';
import { Select, Space, Typography, Checkbox, Alert, Spin, Button, Tag } from 'antd';
import { getPlaybooks } from '@/services/rest/playbooks/playbooks';
import { getAllDevices } from '@/services/rest/devices/devices';
import { PlaybookConfig } from '../WidgetSettings.types';
import { API } from 'ssm-shared-lib';

const { Text } = Typography;

interface PlaybookSelectorProps {
  value?: PlaybookConfig;
  onChange: (value: PlaybookConfig) => void;
  maxPlaybooks?: number;
  requireDeviceSelection?: boolean;
  disabled?: boolean;
}

const PlaybookSelector: React.FC<PlaybookSelectorProps> = ({
  value,
  onChange,
  maxPlaybooks,
  requireDeviceSelection = false,
  disabled = false,
}) => {
  const [playbooks, setPlaybooks] = useState<API.PlaybookFile[]>([]);
  const [devices, setDevices] = useState<API.DeviceItem[]>([]);
  const [loadingPlaybooks, setLoadingPlaybooks] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const currentValue: PlaybookConfig = value || {
    selectedPlaybooks: [],
  };

  useEffect(() => {
    // Load playbooks
    setLoadingPlaybooks(true);
    getPlaybooks()
      .then(response => {
        if (response.data) {
          setPlaybooks(response.data);
        }
      })
      .catch(error => {
        console.error('Failed to load playbooks:', error);
      })
      .finally(() => {
        setLoadingPlaybooks(false);
      });

    // Load devices
    setLoadingDevices(true);
    getAllDevices()
      .then(response => {
        if (response.data) {
          setDevices(response.data);
        }
      })
      .catch(error => {
        console.error('Failed to load devices:', error);
      })
      .finally(() => {
        setLoadingDevices(false);
      });
  }, []);

  const handlePlaybookToggle = (playbookUuid: string, checked: boolean) => {
    if (checked) {
      // Check if we've reached the max playbooks limit
      if (maxPlaybooks && currentValue.selectedPlaybooks.length >= maxPlaybooks) {
        return;
      }

      onChange({
        selectedPlaybooks: [
          ...currentValue.selectedPlaybooks,
          {
            uuid: playbookUuid,
            deviceUuids: [],
          },
        ],
      });
    } else {
      onChange({
        selectedPlaybooks: currentValue.selectedPlaybooks.filter(
          p => p.uuid !== playbookUuid
        ),
      });
    }
  };

  const handleDeviceSelection = (playbookUuid: string, deviceUuids: string[]) => {
    onChange({
      selectedPlaybooks: currentValue.selectedPlaybooks.map(p =>
        p.uuid === playbookUuid ? { ...p, deviceUuids } : p
      ),
    });
  };

  const selectAll = () => {
    const allPlaybookUuids = playbooks
      .slice(0, maxPlaybooks || playbooks.length)
      .map(p => p.uuid);
    
    onChange({
      selectedPlaybooks: allPlaybookUuids.map(uuid => ({
        uuid,
        deviceUuids: [],
      })),
    });
  };

  const deselectAll = () => {
    onChange({
      selectedPlaybooks: [],
    });
  };

  const isLoading = loadingPlaybooks || loadingDevices;
  const selectedCount = currentValue.selectedPlaybooks.length;
  const canSelectMore = !maxPlaybooks || selectedCount < maxPlaybooks;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin tip="Loading playbooks and devices..." />
      </div>
    );
  }

  if (playbooks.length === 0) {
    return (
      <Alert
        message="No Playbooks Available"
        description="No playbooks found. Please create playbooks first."
        type="info"
        showIcon
      />
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Select Playbooks</Text>
        <Space>
          {maxPlaybooks && (
            <Tag color={canSelectMore ? 'blue' : 'red'}>
              {selectedCount} / {maxPlaybooks}
            </Tag>
          )}
          <Button size="small" onClick={selectAll} disabled={disabled}>
            Select All
          </Button>
          <Button size="small" onClick={deselectAll} disabled={disabled}>
            Clear
          </Button>
        </Space>
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {playbooks.map(playbook => {
            const isSelected = currentValue.selectedPlaybooks.some(
              p => p.uuid === playbook.uuid
            );
            const selectedPlaybook = currentValue.selectedPlaybooks.find(
              p => p.uuid === playbook.uuid
            );

            return (
              <div
                key={playbook.uuid}
                style={{
                  padding: 12,
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  background: isSelected ? '#f6f6f6' : 'white',
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={e => handlePlaybookToggle(playbook.uuid, e.target.checked)}
                  disabled={disabled || (!isSelected && !canSelectMore)}
                >
                  <Text strong>{playbook.name}</Text>
                </Checkbox>

                {isSelected && (
                  <div style={{ marginLeft: 24, marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Target devices {requireDeviceSelection ? '(required)' : '(optional)'}:
                    </Text>
                    <Select
                      mode="multiple"
                      style={{ width: '100%', marginTop: 4 }}
                      placeholder="All devices"
                      value={selectedPlaybook?.deviceUuids || []}
                      onChange={deviceUuids => handleDeviceSelection(playbook.uuid, deviceUuids)}
                      options={devices.map(device => ({
                        label: device.fqdn || device.ip || device.uuid,
                        value: device.uuid,
                      }))}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Space>
      </div>

      {!requireDeviceSelection && (
        <Alert
          message="Device Selection"
          description="If no devices are selected for a playbook, it will target all available devices."
          type="info"
          showIcon
          style={{ marginTop: 12 }}
        />
      )}
    </Space>
  );
};

export default PlaybookSelector;
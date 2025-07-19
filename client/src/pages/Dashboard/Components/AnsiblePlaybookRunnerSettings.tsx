import React, { useState, useEffect } from 'react';
import { Form, Select, Checkbox, Space, Typography, Spin, Alert, Button, Divider } from 'antd';
import { ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { getPlaybooks } from '@/services/rest/playbooks/playbooks';
import { getAllDevices } from '@/services/rest/devices/devices';
import { API } from 'ssm-shared-lib';

const { Text } = Typography;

export interface PlaybookSelection {
  uuid: string;
  name: string;
  selected: boolean;
  deviceUuids: string[];
}

interface AnsiblePlaybookRunnerSettingsProps {
  value?: any;
  onChange?: (value: any) => void;
  widgetSettings?: any;
}

const AnsiblePlaybookRunnerSettings: React.FC<AnsiblePlaybookRunnerSettingsProps> = ({
  value,
  onChange,
  widgetSettings
}) => {
  const [playbooks, setPlaybooks] = useState<API.PlaybookFile[]>([]);
  const [devices, setDevices] = useState<API.DeviceItem[]>([]);
  const [loadingPlaybooks, setLoadingPlaybooks] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selections, setSelections] = useState<PlaybookSelection[]>([]);

  // Load playbooks and devices
  useEffect(() => {
    const fetchData = async () => {
      // Fetch playbooks
      setLoadingPlaybooks(true);
      try {
        const playbooksRes = await getPlaybooks();
        if (playbooksRes.data) {
          setPlaybooks(playbooksRes.data);
          
          // Initialize selections based on current settings
          const currentSelectedPlaybooks = widgetSettings?.selectedPlaybooks || [];
          const initialSelections = playbooksRes.data.map(playbook => {
            const existing = currentSelectedPlaybooks.find((sp: any) => sp.uuid === playbook.uuid);
            return {
              uuid: playbook.uuid,
              name: playbook.name,
              selected: !!existing,
              deviceUuids: existing?.deviceUuids || []
            };
          });
          setSelections(initialSelections);
        }
      } catch (error) {
        console.error('Failed to fetch playbooks:', error);
      } finally {
        setLoadingPlaybooks(false);
      }

      // Fetch devices
      setLoadingDevices(true);
      try {
        const devicesRes = await getAllDevices();
        if (devicesRes.data) {
          setDevices(devicesRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchData();
  }, [widgetSettings]);

  // Update parent when selections change
  useEffect(() => {
    const selectedPlaybooks = selections
      .filter(s => s.selected)
      .map(s => ({
        uuid: s.uuid,
        deviceUuids: s.deviceUuids
      }));
    
    onChange?.({ selectedPlaybooks });
  }, [selections, onChange]);

  const handlePlaybookToggle = (playbookUuid: string, checked: boolean) => {
    setSelections(prev => prev.map(s => 
      s.uuid === playbookUuid 
        ? { ...s, selected: checked, deviceUuids: checked ? s.deviceUuids : [] }
        : s
    ));
  };

  const handleDeviceSelection = (playbookUuid: string, deviceUuids: string[]) => {
    setSelections(prev => prev.map(s => 
      s.uuid === playbookUuid 
        ? { ...s, deviceUuids }
        : s
    ));
  };

  const selectAllPlaybooks = () => {
    setSelections(prev => prev.map(s => ({ ...s, selected: true })));
  };

  const deselectAllPlaybooks = () => {
    setSelections(prev => prev.map(s => ({ ...s, selected: false, deviceUuids: [] })));
  };

  if (loadingPlaybooks || loadingDevices) {
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
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Select Playbooks to Display</Text>
        <div style={{ marginTop: 8 }}>
          <Space>
            <Button size="small" onClick={selectAllPlaybooks}>Select All</Button>
            <Button size="small" onClick={deselectAllPlaybooks}>Deselect All</Button>
          </Space>
        </div>
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {selections.map((selection) => (
          <div 
            key={selection.uuid} 
            style={{ 
              marginBottom: 16, 
              padding: 12, 
              border: '1px solid #f0f0f0',
              borderRadius: 4,
              background: selection.selected ? '#f6f6f6' : 'white'
            }}
          >
            <Checkbox
              checked={selection.selected}
              onChange={(e) => handlePlaybookToggle(selection.uuid, e.target.checked)}
              style={{ marginBottom: 8 }}
            >
              <Text strong>{selection.name}</Text>
            </Checkbox>
            
            {selection.selected && (
              <div style={{ marginLeft: 24, marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Select target devices (leave empty for all devices):
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', marginTop: 4 }}
                  placeholder="All devices"
                  value={selection.deviceUuids}
                  onChange={(values) => handleDeviceSelection(selection.uuid, values)}
                  options={devices.map(device => ({
                    label: device.fqdn || device.ip || device.uuid,
                    value: device.uuid
                  }))}
                  maxTagCount="responsive"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Divider style={{ margin: '16px 0' }} />
      
      <Alert
        message="Widget Behavior"
        description={
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li>If no playbooks are selected, the widget will show the first 4 playbooks</li>
            <li>If no devices are selected for a playbook, it will target all devices</li>
            <li>Click "Run" on any playbook to execute it on the configured devices</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginTop: 12 }}
      />
    </div>
  );
};

export default AnsiblePlaybookRunnerSettings;
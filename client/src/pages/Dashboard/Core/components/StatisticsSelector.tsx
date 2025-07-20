/**
 * Statistics Selector Component
 * Provides UI for selecting data type, source, and metrics
 */

import React, { useState, useEffect } from 'react';
import { Select, Space, Spin, Typography } from 'antd';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getContainers } from '@/services/rest/containers/containers';
import { StatisticsConfig } from '../WidgetSettings.types';
import { API } from 'ssm-shared-lib';

const { Text } = Typography;

interface StatisticsSelectorProps {
  value?: StatisticsConfig;
  onChange: (value: StatisticsConfig) => void;
  supportedDataTypes?: Array<'device' | 'container'>;
  supportedMetrics?: Record<string, string[]>;
  disabled?: boolean;
  selectionMode?: 'single' | 'multiple';
}

const defaultMetrics: Record<string, Array<{ label: string; value: string }>> = {
  device: [
    { label: 'CPU Usage', value: 'cpu_usage' },
    { label: 'Memory Usage', value: 'memory_usage' },
    { label: 'Memory Free', value: 'memory_free' },
    { label: 'Storage Usage', value: 'storage_usage' },
    { label: 'Storage Free', value: 'storage_free' },
    { label: 'Containers', value: 'containers' },
  ],
  container: [
    { label: 'CPU Usage', value: 'container_cpu_usage' },
    { label: 'Memory Usage', value: 'container_memory_usage' },
  ],
};

const StatisticsSelector: React.FC<StatisticsSelectorProps> = ({
  value,
  onChange,
  supportedDataTypes = ['device', 'container'],
  supportedMetrics,
  disabled = false,
  selectionMode = 'multiple',
}) => {
  const [devices, setDevices] = useState<API.DeviceItem[]>([]);
  const [containers, setContainers] = useState<API.Container[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingContainers, setLoadingContainers] = useState(false);

  const currentValue: StatisticsConfig = value || {
    dataType: 'device',
    source: ['all'],
    metric: 'cpu_usage',
  };

  useEffect(() => {
    // Load devices
    if (supportedDataTypes.includes('device')) {
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
    }

    // Load containers
    if (supportedDataTypes.includes('container')) {
      setLoadingContainers(true);
      getContainers()
        .then(response => {
          if (response.data) {
            setContainers(response.data);
          }
        })
        .catch(error => {
          console.error('Failed to load containers:', error);
        })
        .finally(() => {
          setLoadingContainers(false);
        });
    }
  }, [supportedDataTypes]);

  const handleDataTypeChange = (dataType: 'device' | 'container') => {
    onChange({
      ...currentValue,
      dataType,
      source: ['all'], // Reset source when data type changes
      metric: dataType === 'device' ? 'cpu_usage' : 'container_cpu_usage', // Set appropriate default metric
    });
  };

  const handleSourceChange = (source: string | string[]) => {
    // For single selection mode, convert single string to array format for consistency
    const sourceArray = Array.isArray(source) ? source : [source];
    
    // If in single selection mode and multiple items selected, only keep the last one
    let finalSource = sourceArray;
    if (selectionMode === 'single' && sourceArray.length > 1) {
      finalSource = [sourceArray[sourceArray.length - 1]];
    }
    
    onChange({
      ...currentValue,
      source: finalSource,
    });
  };

  const handleMetricChange = (metric: string) => {
    onChange({
      ...currentValue,
      metric,
    });
  };

  const getSourceOptions = () => {
    const baseOptions = [{ label: 'All', value: 'all' }];

    if (currentValue.dataType === 'device') {
      return [
        ...baseOptions,
        ...devices.map(device => ({
          label: device.fqdn || device.ip || device.uuid,
          value: device.uuid,
        })),
      ];
    } else {
      return [
        ...baseOptions,
        ...containers.map(container => ({
          label: container.customName || container.name || container.id,
          value: container.id,
        })),
      ];
    }
  };

  const getMetricOptions = () => {
    if (supportedMetrics && supportedMetrics[currentValue.dataType]) {
      return supportedMetrics[currentValue.dataType].map(metric => ({
        label: metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: metric,
      }));
    }
    return defaultMetrics[currentValue.dataType] || [];
  };

  const isLoading = loadingDevices || loadingContainers;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>Data Type</Text>
        <Select
          value={currentValue.dataType}
          onChange={handleDataTypeChange}
          options={supportedDataTypes.map(type => ({
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value: type,
          }))}
          style={{ width: '100%' }}
          disabled={disabled}
        />
      </div>

      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>Source</Text>
        <Select
          mode={selectionMode === 'multiple' ? 'multiple' : undefined}
          value={selectionMode === 'single' ? currentValue.source[0] : currentValue.source}
          onChange={handleSourceChange}
          options={getSourceOptions()}
          placeholder={`Select ${currentValue.dataType}s`}
          style={{ width: '100%' }}
          loading={isLoading}
          disabled={disabled || isLoading}
          notFoundContent={isLoading ? <Spin size="small" /> : 'No data'}
          maxTagCount={selectionMode === 'single' ? 1 : undefined}
        />
      </div>

      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>Metric</Text>
        <Select
          value={currentValue.metric}
          onChange={handleMetricChange}
          options={getMetricOptions()}
          placeholder="Select metric"
          style={{ width: '100%' }}
          disabled={disabled}
        />
      </div>

      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>Aggregation</Text>
        <Select
          value={currentValue.aggregation || 'average'}
          onChange={aggregation => onChange({ ...currentValue, aggregation: aggregation as StatisticsConfig['aggregation'] })}
          options={[
            { label: 'Average', value: 'average' },
            { label: 'Sum', value: 'sum' },
            { label: 'Minimum', value: 'min' },
            { label: 'Maximum', value: 'max' },
          ]}
          style={{ width: '100%' }}
          disabled={disabled}
        />
      </div>
    </Space>
  );
};

export default StatisticsSelector;
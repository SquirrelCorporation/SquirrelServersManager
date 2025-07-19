import React from 'react';
import { Collapse, Button, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface DebugPanelProps {
  data: any;
  title?: string;
  maxHeight?: number;
  componentName?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  data, 
  title = 'Debug: Raw JSON Data',
  maxHeight = 300,
  componentName
}) => {
  const handleCopy = () => {
    const debugData = JSON.stringify({
      component: componentName,
      ...data
    }, null, 2);
    navigator.clipboard.writeText(debugData);
    message.success('Debug data copied to clipboard');
  };

  return (
    <Collapse 
      ghost 
      style={{ marginTop: '16px' }}
      items={[
        {
          key: '1',
          label: (
            <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
              {title}
            </Typography.Text>
          ),
          children: (
            <div style={{ position: 'relative' }}>
              <Button
                icon={<CopyOutlined />}
                size="small"
                style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px',
                  zIndex: 1
                }}
                onClick={handleCopy}
              >
                Copy
              </Button>
              <div style={{ 
                backgroundColor: '#0a0a0a', 
                padding: '12px', 
                borderRadius: '4px',
                maxHeight: `${maxHeight}px`,
                overflow: 'auto'
              }}>
                <Typography.Text style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                  <pre style={{ color: '#52c41a', margin: 0 }}>
                    {JSON.stringify({
                      component: componentName,
                      ...data
                    }, null, 2)}
                  </pre>
                </Typography.Text>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default DebugPanel;
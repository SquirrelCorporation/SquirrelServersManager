import { PluginStoreInfo } from '@/types/plugin.types';
import { Avatar, Descriptions, Modal, Tag, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph, Text } = Typography;

interface PluginDetailModalProps {
  plugin: PluginStoreInfo | null;
  open: boolean;
  onClose: () => void;
}

const PluginDetailModal: React.FC<PluginDetailModalProps> = ({
  plugin,
  open,
  onClose,
}) => {
  if (!plugin) {
    return null; // Don't render anything if no plugin is selected
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose} // Simple close for now, could be install later
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={plugin.iconUrl} shape="square" size="large" style={{ marginRight: 16 }} />
          <Title level={4} style={{ marginBottom: 0 }}>{plugin.name}</Title>
        </div>
      }
      footer={null} // Hide default OK/Cancel buttons for now
      width={700} // Wider modal for details
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Plugin ID">{plugin.id}</Descriptions.Item>
        <Descriptions.Item label="Version">{plugin.version}</Descriptions.Item>
        {plugin.author && (
          <Descriptions.Item label="Author">{plugin.author}</Descriptions.Item>
        )}
        <Descriptions.Item label="Description">
          <Paragraph style={{ marginBottom: 0 }}>{plugin.description}</Paragraph>
        </Descriptions.Item>
        {/* Add more details if available and needed */}
        <Descriptions.Item label="Package URL">
          <Text copyable code style={{ wordBreak: 'break-all' }}>{plugin.packageUrl}</Text>
        </Descriptions.Item>
        {plugin.manifestUrl && (
          <Descriptions.Item label="Manifest URL">
            <Text copyable code style={{ wordBreak: 'break-all' }}>{plugin.manifestUrl}</Text>
          </Descriptions.Item>
        )}
        {plugin.checksum && (
           <Descriptions.Item label="Checksum (SHA256)">
            <Text copyable code style={{ wordBreak: 'break-all' }}>{plugin.checksum}</Text>
          </Descriptions.Item>
        )}
         {plugin.checksumUrl && (
          <Descriptions.Item label="Checksum URL">
            <Text copyable code style={{ wordBreak: 'break-all' }}>{plugin.checksumUrl}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>
      {/* Future: Add install button here? */}
    </Modal>
  );
};

export default PluginDetailModal; 
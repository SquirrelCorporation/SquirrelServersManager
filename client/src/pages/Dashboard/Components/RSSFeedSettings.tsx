import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, InputNumber, Alert, Card, Checkbox, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, BgColorsOutlined } from '@ant-design/icons';
import { FeedConfig } from '@/services/rest/rss.service';
import { COLOR_PALETTES } from './utils/colorPalettes';

interface RSSFeedSettingsProps {
  value?: {
    feeds?: FeedConfig[];
    refreshInterval?: number;
    maxItems?: number;
    colorPalette?: string;
    customColors?: string[];
  };
  onChange?: (value: any) => void;
}

const RSSFeedSettings: React.FC<RSSFeedSettingsProps> = ({ value = {}, onChange }) => {
  const [feeds, setFeeds] = useState<FeedConfig[]>(value.feeds || []);
  const [refreshInterval, setRefreshInterval] = useState(value.refreshInterval || 30);
  const [maxItems, setMaxItems] = useState(value.maxItems || 20);
  const [colorPalette, setColorPalette] = useState(value.colorPalette || 'default');
  const [customColors, setCustomColors] = useState<string[]>(value.customColors || []);
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');

  // Default feeds
  const defaultFeeds: FeedConfig[] = [
    {
      id: 'docker-blog',
      name: 'Docker Blog',
      url: 'https://www.docker.com/blog/feed/',
      enabled: true,
    },
    {
      id: 'kubernetes-blog',
      name: 'Kubernetes Blog',
      url: 'https://kubernetes.io/feed.xml',
      enabled: true,
    },
    {
      id: 'ansible-blog',
      name: 'Ansible Blog',
      url: 'https://www.ansible.com/blog/rss.xml',
      enabled: true,
    },
  ];

  useEffect(() => {
    // If no feeds, set defaults
    if (feeds.length === 0) {
      setFeeds(defaultFeeds);
    }
  }, []);

  useEffect(() => {
    // Update parent whenever settings change
    onChange?.({
      feeds,
      refreshInterval,
      maxItems,
      colorPalette,
      customColors
    });
  }, [feeds, refreshInterval, maxItems, colorPalette, customColors, onChange]);

  const addFeed = () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      return;
    }

    const newFeed: FeedConfig = {
      id: Date.now().toString(),
      name: newFeedName.trim(),
      url: newFeedUrl.trim(),
      enabled: true,
    };

    setFeeds([...feeds, newFeed]);
    setNewFeedName('');
    setNewFeedUrl('');
  };

  const removeFeed = (id: string) => {
    setFeeds(feeds.filter(feed => feed.id !== id));
  };

  const toggleFeed = (id: string) => {
    setFeeds(feeds.map(feed => 
      feed.id === id ? { ...feed, enabled: !feed.enabled } : feed
    ));
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Typography.Title level={5}>RSS Feed Configuration</Typography.Title>
      
      <Card title="Display Settings" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Typography.Text>Refresh Interval (minutes)</Typography.Text>
            <InputNumber
              min={5}
              max={1440}
              value={refreshInterval}
              onChange={(val) => setRefreshInterval(val || 30)}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <div>
            <Typography.Text>Maximum Items to Display</Typography.Text>
            <InputNumber
              min={5}
              max={50}
              value={maxItems}
              onChange={(val) => setMaxItems(val || 20)}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <div>
            <Typography.Text>
              <BgColorsOutlined style={{ marginRight: 8 }} />
              Badge Color Theme
            </Typography.Text>
            <Select
              value={colorPalette}
              onChange={setColorPalette}
              style={{ width: '100%', marginTop: 4 }}
              options={Object.values(COLOR_PALETTES).map(palette => ({
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {palette.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: color,
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        />
                      ))}
                    </div>
                    <span>{palette.name}</span>
                  </div>
                ),
                value: palette.id
              }))}
            />
          </div>
        </Space>
      </Card>

      <Card title="RSS Feeds" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="Add RSS feed URLs to display news and updates in your dashboard"
            type="info"
            showIcon
          />
          
          <div>
            <Input
              placeholder="Feed name (e.g., Tech News)"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="RSS feed URL"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                onPressEnter={addFeed}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addFeed}
                disabled={!newFeedName.trim() || !newFeedUrl.trim()}
              >
                Add
              </Button>
            </Space.Compact>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {feeds.map((feed) => (
                <Card key={feed.id} size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Space>
                      <Checkbox
                        checked={feed.enabled}
                        onChange={() => toggleFeed(feed.id)}
                      />
                      <div>
                        <Typography.Text strong>{feed.name}</Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ display: 'block', fontSize: 12 }}
                          ellipsis
                        >
                          {feed.url}
                        </Typography.Text>
                      </div>
                    </Space>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => removeFeed(feed.id)}
                    />
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        </Space>
      </Card>
    </Space>
  );
};

export default RSSFeedSettings;
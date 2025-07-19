import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Spin, Badge, Input, message } from 'antd';
import { ReloadOutlined, LinkOutlined, PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import DebugOverlay from './DebugOverlay';
import { fetchRSSFeeds, RSSFeedItem, FeedConfig } from '@/services/rest/rss.service';

// Use types from the service
type RSSItem = RSSFeedItem;
type RSSFeed = FeedConfig;

interface RSSFeedWidgetProps {
  title?: string;
  cardStyle?: React.CSSProperties;
  widgetSettings?: {
    feeds?: FeedConfig[];
    refreshInterval?: number;
    maxItems?: number;
  };
}

const RSSFeedWidget: React.FC<RSSFeedWidgetProps> = ({
  title = 'News Feed',
  cardStyle,
  widgetSettings,
}) => {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const refreshInterval = widgetSettings?.refreshInterval || 30;
  const maxItems = widgetSettings?.maxItems || 20;

  // Default feeds
  const defaultFeeds: RSSFeed[] = [
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

  // Load feeds from widget settings or localStorage as fallback
  useEffect(() => {
    if (widgetSettings?.feeds && widgetSettings.feeds.length > 0) {
      setFeeds(widgetSettings.feeds);
    } else {
      const savedFeeds = localStorage.getItem('ssm-rss-feeds');
      if (savedFeeds) {
        try {
          setFeeds(JSON.parse(savedFeeds));
        } catch (error) {
          console.error('Failed to load RSS feeds:', error);
          setFeeds(defaultFeeds);
        }
      } else {
        setFeeds(defaultFeeds);
      }
    }
  }, [widgetSettings?.feeds]);

  // Fetch RSS feeds from the backend API
  const fetchFeeds = async () => {
    setLoading(true);
    try {
      // Only fetch if there are enabled feeds
      const enabledFeeds = feeds.filter(feed => feed.enabled);
      if (enabledFeeds.length === 0) {
        setItems([]);
        setLastUpdate(new Date());
        return;
      }

      const response = await fetchRSSFeeds(enabledFeeds);
      
      if (response.data) {
        // Sort by date and limit items
        const sortedItems = response.data
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
          .slice(0, maxItems);
        
        setItems(sortedItems);
        setLastUpdate(new Date());
      } else {
        setItems([]);
        message.warning('No RSS items found');
      }
    } catch (error) {
      console.error('Failed to fetch RSS feeds:', error);
      message.error('Failed to fetch news feeds. Please check your feed URLs.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh based on settings
  useEffect(() => {
    if (feeds.length > 0) {
      fetchFeeds();
      // Refresh based on settings
      const interval = setInterval(fetchFeeds, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [feeds, refreshInterval]);

  const saveFeeds = (updatedFeeds: RSSFeed[]) => {
    // Only save to localStorage if not using widget settings
    if (!widgetSettings?.feeds) {
      localStorage.setItem('ssm-rss-feeds', JSON.stringify(updatedFeeds));
    }
    setFeeds(updatedFeeds);
  };

  const addFeed = () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      message.warning('Please enter both name and URL');
      return;
    }

    const newFeed: RSSFeed = {
      id: Date.now().toString(),
      name: newFeedName.trim(),
      url: newFeedUrl.trim(),
      enabled: true,
    };

    saveFeeds([...feeds, newFeed]);
    setNewFeedName('');
    setNewFeedUrl('');
    message.success('RSS feed added');
  };

  const removeFeed = (id: string) => {
    saveFeeds(feeds.filter(feed => feed.id !== id));
    message.success('RSS feed removed');
  };

  const toggleFeed = (id: string) => {
    saveFeeds(feeds.map(feed => 
      feed.id === id ? { ...feed, enabled: !feed.enabled } : feed
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
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
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
        <Typography.Title
          level={4}
          style={{
            color: '#ffffff',
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography.Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
            onClick={() => setShowSettings(!showSettings)}
            style={{ color: '#8c8c8c' }}
          />
          <Button
            type="text"
            icon={<ReloadOutlined />}
            size="small"
            onClick={fetchFeeds}
            loading={loading}
            style={{ color: '#8c8c8c' }}
          />
        </div>
      </div>

      {showSettings && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
            Manage RSS Feeds
          </Typography.Text>
          
          <div style={{ marginBottom: '12px' }}>
            <Input
              placeholder="Feed name"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              style={{ 
                marginBottom: '4px',
                backgroundColor: '#1a1a1a',
                borderColor: '#3a3a3a',
                color: 'white'
              }}
              size="small"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                placeholder="RSS feed URL"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                style={{ 
                  backgroundColor: '#1a1a1a',
                  borderColor: '#3a3a3a',
                  color: 'white',
                  flex: 1
                }}
                onPressEnter={addFeed}
                size="small"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addFeed}
                size="small"
                style={{ backgroundColor: '#4ecb71', borderColor: '#4ecb71' }}
              />
            </div>
          </div>

          {feeds.map((feed) => (
            <div key={feed.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={feed.enabled}
                  onChange={() => toggleFeed(feed.id)}
                  style={{ margin: 0 }}
                />
                <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px' }}>
                  {feed.name}
                </Typography.Text>
              </div>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => removeFeed(feed.id)}
                style={{ color: '#ff4d4f' }}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && items.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={items}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #3a3a3a' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <Typography.Text
                      strong
                      style={{
                        color: '#ffffff',
                        fontSize: '13px',
                        lineHeight: '1.3',
                        flex: 1,
                        marginRight: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(item.link, '_blank')}
                    >
                      {item.title}
                    </Typography.Text>
                    <LinkOutlined
                      style={{ color: '#8c8c8c', fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => window.open(item.link, '_blank')}
                    />
                  </div>
                  <Typography.Text
                    style={{
                      color: '#8c8c8c',
                      fontSize: '11px',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '4px',
                    }}
                  >
                    {item.description}
                  </Typography.Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge
                      count={item.source}
                      style={{
                        backgroundColor: '#4ecb71',
                        fontSize: '10px',
                        height: '16px',
                        lineHeight: '16px',
                        borderRadius: '8px',
                      }}
                    />
                    <Typography.Text style={{ color: '#666', fontSize: '10px' }}>
                      {formatDate(item.pubDate)}
                    </Typography.Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}

        {items.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            color: '#8c8c8c', 
            fontSize: '14px',
            marginTop: '60px'
          }}>
            No news items available. Try refreshing or check your feed settings.
          </div>
        )}
      </div>

      {lastUpdate && (
        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
      <DebugOverlay fileName="RSSFeedWidget.tsx" componentName="RSSFeedWidget" />
    </Card>
  );
};

export default RSSFeedWidget;
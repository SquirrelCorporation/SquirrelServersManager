import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, List, Button, Spin, Badge, message } from 'antd';
import { ReloadOutlined, LinkOutlined } from '@ant-design/icons';
import { fetchRSSFeeds, RSSFeedItem, FeedConfig } from '@/services/rest/rss.service';
import { getColorForItem } from './utils/colorPalettes';

// Use types from the service
type RSSItem = RSSFeedItem;
type RSSFeed = FeedConfig;

interface RSSFeedWidgetProps {
  title?: string;
  cardStyle?: React.CSSProperties;
  colorPalette?: string;
  customColors?: string[];
  widgetSettings?: {
    feeds?: FeedConfig[];
    refreshInterval?: number;
    maxItems?: number;
    colorPalette?: string;
    customColors?: string[];
  };
}

const RSSFeedWidget: React.FC<RSSFeedWidgetProps> = ({
  title = 'News Feed',
  cardStyle,
  colorPalette = 'default',
  customColors,
  widgetSettings,
}) => {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const refreshInterval = widgetSettings?.refreshInterval || 30;
  const maxItems = widgetSettings?.maxItems || 20;
  
  // Get effective color palette - priority: widgetSettings > props > default
  const effectiveColorPalette = widgetSettings?.colorPalette || colorPalette || 'default';
  const effectiveCustomColors = widgetSettings?.customColors || customColors;

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

  // Load feeds from widget settings
  useEffect(() => {
    if (widgetSettings?.feeds && widgetSettings.feeds.length > 0) {
      setFeeds(widgetSettings.feeds);
    } else {
      setFeeds(defaultFeeds);
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

  // Get badge color based on source name using color palette
  const getBadgeColor = (sourceName: string) => {
    if (effectiveCustomColors && effectiveCustomColors.length > 0) {
      // Use custom colors with hash-based assignment
      const hash = sourceName.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const colorIndex = Math.abs(hash) % effectiveCustomColors.length;
      return effectiveCustomColors[colorIndex];
    }
    
    // Use palette colors
    return getColorForItem(sourceName, effectiveColorPalette);
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
        <Button
          type="text"
          icon={<ReloadOutlined />}
          size="small"
          onClick={fetchFeeds}
          loading={loading}
          style={{ color: '#8c8c8c' }}
        />
      </div>

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
                  <Typography.Paragraph
                    style={{
                      color: '#8c8c8c',
                      fontSize: '11px',
                      lineHeight: '1.3',
                      marginBottom: '4px',
                      marginTop: 0,
                    }}
                    ellipsis={{ rows: 3, expandable: false }}
                  >
                    {item.description}
                  </Typography.Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge
                      count={item.source}
                      style={{
                        backgroundColor: getBadgeColor(item.source),
                        color: '#000',
                        fontSize: '10px',
                        height: '16px',
                        lineHeight: '16px',
                        borderRadius: '8px',
                        fontWeight: 500,
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
    </Card>
  );
};

export default RSSFeedWidget;
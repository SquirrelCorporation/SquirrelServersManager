import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Spin, Badge, Input, message } from 'antd';
import { ReloadOutlined, ExternalLinkOutlined, PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

interface RSSFeedWidgetProps {
  title?: string;
  cardStyle?: React.CSSProperties;
}

const RSSFeedWidget: React.FC<RSSFeedWidgetProps> = ({
  title = 'News Feed',
  cardStyle,
}) => {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
      id: 'security-advisories',
      name: 'Security Advisories',
      url: 'https://feeds.feedburner.com/oreilly/radar',
      enabled: true,
    },
    {
      id: 'ansible-blog',
      name: 'Ansible Blog',
      url: 'https://www.ansible.com/blog/rss.xml',
      enabled: true,
    },
  ];

  // Load feeds from localStorage or use defaults
  useEffect(() => {
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
  }, []);

  // Mock RSS fetching function (in real implementation, this would use a backend service)
  const fetchRSSFeeds = async () => {
    setLoading(true);
    try {
      // Mock data since we can't directly fetch RSS feeds from frontend due to CORS
      const mockItems: RSSItem[] = [
        {
          title: "Docker Desktop 4.28 Release: New Features for Enhanced Development",
          link: "https://www.docker.com/blog/docker-desktop-4-28-release/",
          description: "Explore the latest Docker Desktop features including improved container management and security enhancements.",
          pubDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          source: "Docker Blog",
        },
        {
          title: "Kubernetes 1.29 Security Update Available",
          link: "https://kubernetes.io/blog/2024/01/security-update/",
          description: "Critical security patches for Kubernetes clusters. Update recommended for all production environments.",
          pubDate: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          source: "Kubernetes Blog",
        },
        {
          title: "Ansible Automation Platform: Best Practices for Server Management",
          link: "https://www.ansible.com/blog/automation-best-practices/",
          description: "Learn how to optimize your server management workflows with Ansible automation patterns.",
          pubDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          source: "Ansible Blog",
        },
        {
          title: "SSH Security Advisory: Update Your Keys",
          link: "https://security.example.com/ssh-advisory",
          description: "Important security recommendations for SSH key management and server access controls.",
          pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          source: "Security Advisories",
        },
        {
          title: "Container Image Vulnerability Scanning: New Tools Available",
          link: "https://security.example.com/container-scanning",
          description: "Updated container scanning tools help identify vulnerabilities in Docker images before deployment.",
          pubDate: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
          source: "Security Advisories",
        },
      ];

      // Filter items based on enabled feeds
      const enabledFeedNames = feeds.filter(feed => feed.enabled).map(feed => feed.name);
      const filteredItems = mockItems.filter(item => enabledFeedNames.includes(item.source));

      setItems(filteredItems.slice(0, 10)); // Limit to 10 items
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch RSS feeds:', error);
      message.error('Failed to fetch news feeds');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh every 30 minutes
  useEffect(() => {
    if (feeds.length > 0) {
      fetchRSSFeeds();
      const interval = setInterval(fetchRSSFeeds, 30 * 60 * 1000); // 30 minutes
      return () => clearInterval(interval);
    }
  }, [feeds]);

  const saveFeeds = (updatedFeeds: RSSFeed[]) => {
    localStorage.setItem('ssm-rss-feeds', JSON.stringify(updatedFeeds));
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
            onClick={fetchRSSFeeds}
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
                    <ExternalLinkOutlined
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
    </Card>
  );
};

export default RSSFeedWidget;
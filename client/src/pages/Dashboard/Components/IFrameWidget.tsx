import React, { useState, useRef } from 'react';
import { Card, Typography, Button, Input, message, Spin, Alert } from 'antd';
import { ReloadOutlined, ExpandOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import DebugOverlay from './DebugOverlay';

interface IFrameWidgetProps {
  title?: string;
  defaultUrl?: string;
  allowedDomains?: string[];
  cardStyle?: React.CSSProperties;
}

const IFrameWidget: React.FC<IFrameWidgetProps> = ({
  title = 'External Service',
  defaultUrl = '',
  allowedDomains = [],
  cardStyle,
}) => {
  const [url, setUrl] = useState(() => {
    const savedUrl = localStorage.getItem(`ssm-iframe-url-${title}`);
    return savedUrl || defaultUrl;
  });
  const [inputUrl, setInputUrl] = useState(url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Common monitoring tools and documentation URLs
  const quickUrls = [
    { name: 'Grafana', url: 'http://localhost:3000' },
    { name: 'Prometheus', url: 'http://localhost:9090' },
    { name: 'Portainer', url: 'http://localhost:9000' },
    { name: 'Netdata', url: 'http://localhost:19999' },
    { name: 'Uptime Kuma', url: 'http://localhost:3001' },
    { name: 'SSM Docs', url: 'https://squirrelserversmanager.io/docs/' },
  ];

  const isValidUrl = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      
      // Check if domain is allowed (if allowedDomains is specified)
      if (allowedDomains.length > 0) {
        const hostname = urlObj.hostname;
        const isAllowed = allowedDomains.some(domain => 
          hostname === domain || hostname.endsWith(`.${domain}`) || domain === '*'
        );
        if (!isAllowed) {
          setError(`Domain ${hostname} is not in the allowed domains list`);
          return false;
        }
      }
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setError('Only HTTP and HTTPS URLs are allowed');
        return false;
      }
      
      return true;
    } catch {
      setError('Invalid URL format');
      return false;
    }
  };

  const loadUrl = (newUrl: string) => {
    if (!newUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setError(null);
    
    if (!isValidUrl(newUrl)) {
      return;
    }

    setLoading(true);
    setUrl(newUrl);
    setInputUrl(newUrl);
    
    // Save to localStorage
    localStorage.setItem(`ssm-iframe-url-${title}`, newUrl);
    
    // Reset loading state after iframe loads
    setTimeout(() => setLoading(false), 2000);
    
    message.success('URL loaded');
  };

  const reloadIframe = () => {
    if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = iframeRef.current.src;
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to load the page. Check if the URL is accessible and allows embedding.');
  };

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        height: '500px',
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
            onClick={reloadIframe}
            disabled={!url}
            style={{ color: '#8c8c8c' }}
          />
          <Button
            type="text"
            icon={<LinkOutlined />}
            size="small"
            onClick={openInNewTab}
            disabled={!url}
            style={{ color: '#8c8c8c' }}
          />
        </div>
      </div>

      {showSettings && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
            Enter URL to embed
          </Typography.Text>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Input
              placeholder="https://example.com"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onPressEnter={() => loadUrl(inputUrl)}
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#3a3a3a',
                color: 'white',
                flex: 1
              }}
              size="small"
            />
            <Button
              type="primary"
              onClick={() => loadUrl(inputUrl)}
              size="small"
              style={{ backgroundColor: '#4ecb71', borderColor: '#4ecb71' }}
            >
              Load
            </Button>
          </div>

          <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px', marginBottom: '8px', display: 'block' }}>
            Quick access:
          </Typography.Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {quickUrls.map((quickUrl) => (
              <Button
                key={quickUrl.name}
                size="small"
                type="text"
                onClick={() => {
                  setInputUrl(quickUrl.url);
                  loadUrl(quickUrl.url);
                }}
                style={{
                  color: '#4ecb71',
                  fontSize: '11px',
                  height: '24px',
                  padding: '0 8px',
                }}
              >
                {quickUrl.name}
              </Button>
            ))}
          </div>

          {allowedDomains.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px' }}>
                Allowed domains: {allowedDomains.join(', ')}
              </Typography.Text>
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
        />
      )}

      <div style={{ flex: 1, position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <Spin size="large" />
          </div>
        )}
        
        {url ? (
          <iframe
            ref={iframeRef}
            src={url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'white',
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title={title}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            border: '2px dashed #3a3a3a',
          }}>
            <ExpandOutlined style={{ fontSize: '32px', color: '#8c8c8c', marginBottom: '16px' }} />
            <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px', textAlign: 'center' }}>
              No URL configured
            </Typography.Text>
            <Typography.Text style={{ color: '#666', fontSize: '12px', textAlign: 'center', marginTop: '4px' }}>
              Click the settings icon to add a URL
            </Typography.Text>
          </div>
        )}
      </div>

      {url && (
        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '8px', wordBreak: 'break-all' }}>
          {url}
        </div>
      )}
      <DebugOverlay fileName="IFrameWidget.tsx" componentName="IFrameWidget" />
    </Card>
  );
};

export default IFrameWidget;
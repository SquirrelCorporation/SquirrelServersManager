import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface Tip {
  tagText: string;
  title: string;
  description: string;
  imageUrl: string;
  docLink?: string;
}

interface FeaturedAppCardProps {
  tips?: Tip[];
  // Keep backward compatibility
  tagText?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  cardStyle?: React.CSSProperties;
}

const FeaturedAppCard: React.FC<FeaturedAppCardProps> = ({
  tips,
  tagText,
  title,
  description,
  imageUrl,
  cardStyle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTips, setSelectedTips] = useState<Tip[]>([]);

  // For backward compatibility, create tips array from individual props if tips not provided
  const allTips = tips || [{
    tagText: tagText || 'FEATURED APP',
    title: title || 'Default Title',
    description: description || 'Default description',
    imageUrl: imageUrl || '/assets/images/dashboard/featured-app-image.png',
  }];

  // Function to get a random background image (bck1 to bck5)
  const getRandomBackground = () => {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    return `/assets/images/dashboard/tips/bck${randomNum}.png`;
  };

  // Initialize with 3 random tips from the 100
  useEffect(() => {
    if (allTips.length > 3) {
      // Get 3 random tips with random backgrounds
      const shuffled = [...allTips].sort(() => 0.5 - Math.random());
      const tipsWithRandomBg = shuffled.slice(0, 3).map(tip => ({
        ...tip,
        imageUrl: getRandomBackground()
      }));
      setSelectedTips(tipsWithRandomBg);
    } else {
      const tipsWithRandomBg = allTips.map(tip => ({
        ...tip,
        imageUrl: getRandomBackground()
      }));
      setSelectedTips(tipsWithRandomBg);
    }
  }, []);

  const tipsData = selectedTips.length > 0 ? selectedTips : allTips;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? tipsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tipsData.length - 1 ? 0 : prev + 1));
  };

  const currentTip = tipsData[currentIndex];

  const handleTipClick = () => {
    if (currentTip.docLink) {
      const event = new CustomEvent('openDocumentation', {
        detail: { link: currentTip.docLink },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        height: '100%',
        minHeight: '280px',
        ...cardStyle,
      }}
      bodyStyle={{ 
        padding: 0,
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Background Image Container */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundImage: `url(${currentTip.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Gradient Overlay for fade effect */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(to bottom, 
              transparent 0%, 
              transparent 60%, 
              rgba(26,26,26,0.2) 70%, 
              rgba(26,26,26,0.5) 80%, 
              rgba(26,26,26,0.8) 90%, 
              rgba(26,26,26,0.95) 95%,
              #1a1a1a 100%)`,
          }}
        />
      </div>

      {/* Navigation Controls - Only show if multiple tips */}
      {tipsData.length > 1 && (
        <div 
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tipsData.map((_, index) => (
              <div
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === currentIndex ? '#52c41a' : 'rgba(255,255,255,0.3)',
                  transition: 'background-color 0.3s',
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          {/* Chevron Navigation */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handlePrevious}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <LeftOutlined style={{ color: 'white', fontSize: 14 }} />
            </button>
            <button
              onClick={handleNext}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <RightOutlined style={{ color: 'white', fontSize: 14 }} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 24px 24px 24px',
          zIndex: 5,
          cursor: currentTip.docLink ? 'pointer' : 'default',
        }}
        onClick={handleTipClick}
      >
        <Tag
          style={{
            backgroundColor: 'rgba(82, 196, 26, 0.2)',
            borderColor: 'transparent',
            color: '#52c41a',
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {currentTip.tagText.toUpperCase()}
        </Tag>
        
        <Typography.Title
          level={4}
          style={{
            color: '#ffffff',
            margin: '0 0 8px 0',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '1.3',
          }}
        >
          {currentTip.title}
        </Typography.Title>
        
        <Tooltip title={currentTip.description} placement="top">
          <Typography.Paragraph
            style={{ 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: '14px', 
              lineHeight: '1.6',
              margin: 0,
              cursor: 'pointer',
            }}
            ellipsis={{ rows: 2 }}
          >
            {currentTip.description}
          </Typography.Paragraph>
        </Tooltip>
      </div>
    </Card>
  );
};

export default FeaturedAppCard;

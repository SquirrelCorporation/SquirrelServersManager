import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Tag, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface Tip {
  tagText: string;
  title: string;
  description: string;
  imageUrl?: string;
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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
  }, [allTips]);

  const tipsData = selectedTips.length > 0 ? selectedTips : allTips;

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? tipsData.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, tipsData.length]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === tipsData.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, tipsData.length]);

  const handleDotClick = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, currentIndex]);

  // Auto-play carousel effect similar to Next.js examples
  useEffect(() => {
    if (!isPaused && tipsData.length > 1) {
      const interval = setInterval(() => {
        handleNext();
      }, 4000); // 4 seconds like the Next.js example

      return () => clearInterval(interval);
    }
  }, [currentIndex, isPaused, tipsData.length, handleNext]);

  const currentTip = tipsData[currentIndex];

  const handleTipClick = () => {
    if (currentTip?.docLink) {
      const event = new CustomEvent('openDocumentation', {
        detail: { link: currentTip.docLink },
      });
      window.dispatchEvent(event);
    }
  };

  // Safety check - if no current tip, don't render anything
  if (!currentTip) {
    return (
      <Card style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', color: 'white', height: '100%' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Typography.Text style={{ color: 'white' }}>Loading tips...</Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
        height: '100%',
        minHeight: '280px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        ...cardStyle,
      }}
      bodyStyle={{ 
        padding: 0,
        height: '100%',
        position: 'relative',
        minHeight: '280px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 48px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)';
        setIsPaused(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)';
        setIsPaused(false);
      }}
    >
      {/* Sliding Cards Container */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          minHeight: '280px',
          overflow: 'hidden',
        }}
      >
        {tipsData.map((tip, index) => (
          <div
            key={`card-${index}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: `translateX(${(index - currentIndex) * 100}%)`,
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: index === currentIndex ? 2 : 1,
            }}
          >
            {/* Background Image */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                backgroundImage: `url(${tip?.imageUrl || getRandomBackground()})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Gradient Overlay */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(to bottom, 
                  transparent 0%, 
                  transparent 40%, 
                  rgba(26,26,26,0.1) 50%, 
                  rgba(26,26,26,0.3) 65%, 
                  rgba(26,26,26,0.6) 75%, 
                  rgba(26,26,26,0.8) 85%, 
                  rgba(26,26,26,0.95) 95%,
                  #1a1a1a 100%)`,
                }}
            />

            {/* Content */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px 24px 24px 24px',
                zIndex: 10,
                cursor: tip?.docLink ? 'pointer' : 'default',
                minHeight: '120px',
              }}
              onClick={() => {
                if (tip?.docLink) {
                  const event = new CustomEvent('openDocumentation', {
                    detail: { link: tip.docLink },
                  });
                  window.dispatchEvent(event);
                }
              }}
            >
              <Tag
                style={{
                  background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.3), rgba(82, 196, 26, 0.15))',
                  borderColor: 'rgba(82, 196, 26, 0.4)',
                  color: '#52c41a',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  marginBottom: 12,
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(82, 196, 26, 0.3)',
                  boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {tip?.tagText?.toUpperCase() || 'TIP'}
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
                {tip?.title || 'Tip Title'}
              </Typography.Title>
              
              <Tooltip title={tip?.description || 'No description'} placement="top">
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
                  {tip?.description || 'No description available'}
                </Typography.Paragraph>
              </Tooltip>
            </div>
          </div>
        ))}
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
                onClick={() => handleDotClick(index)}
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
    </Card>
  );
};

export default FeaturedAppCard;
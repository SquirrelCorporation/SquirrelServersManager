import { PageContainer } from '@ant-design/pro-components';
import { ConfigProvider, TabsProps, theme, Tooltip, Grid, Button, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useLocation } from '@umijs/max';
import styled from 'styled-components';
import { CompressOutlined, ExpandOutlined } from '@ant-design/icons';

// Main container for the tabs and content
const TabsContainer = styled.div`
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 80vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 8px;
    min-height: calc(100vh - 16px);
    border-radius: 12px;
    flex-direction: column;
  }
`;

// Left navigation panel that can be collapsed
const NavPanel = styled.div<{ $isCompact: boolean }>`
  background: rgba(45, 45, 45, 0.5);
  border-radius: 12px;
  margin: 16px;
  padding: 8px;
  width: ${props => props.$isCompact ? '60px' : '220px'};
  min-width: ${props => props.$isCompact ? '60px' : '220px'};
  position: relative;
  transition: width 0.3s ease, min-width 0.3s ease;

  @media (max-width: 1200px) {
    width: ${props => props.$isCompact ? '60px' : '200px'};
    min-width: ${props => props.$isCompact ? '60px' : '200px'};
  }
  
  @media (max-width: 992px) {
    width: ${props => props.$isCompact ? '60px' : '180px'};
    min-width: ${props => props.$isCompact ? '60px' : '180px'};
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
    margin: 8px 8px 0;
    padding: 4px;
    display: flex;
    justify-content: center;
  }
`;

// Content area that expands to fill available space
const ContentPanel = styled.div`
  flex: 1;
  padding: 24px;
  overflow: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

// Styled tab
const StyledTab = styled.div<{ $active: boolean; $isCompact: boolean }>`
  margin: 2px 0;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.85);
  width: calc(100% - 16px);
  margin-left: 8px;
  margin-right: 8px;
  cursor: pointer;
  background: ${props => props.$active ? 'rgba(60, 60, 60, 0.8)' : 'transparent'};
  
  &:hover {
    background: ${props => props.$active ? 'rgba(60, 60, 60, 0.8)' : 'rgba(60, 60, 60, 0.5)'};
  }

  ${props => props.$isCompact && `
    width: 40px;
    min-width: 40px;
    max-width: 40px;
    padding: 8px 0;
    margin: 4px auto;
    display: flex;
    justify-content: center;
    align-items: center;
  `}

  @media (max-width: 768px) {
    padding: 6px 10px;
    margin: 2px 4px;
    display: inline-block;
    width: auto;
  }
`;

export const TabLabel = styled.div<{ $isCompact: boolean }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
  width: 100%;
  transition: all 0.3s ease;
  
  ${props => props.$isCompact && `
    justify-content: center;
    
    span {
      display: none;
      width: 0;
      overflow: hidden;
    }
    
    div[class*="IconWrapper"] {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  `}
  
  @media (max-width: 1200px) {
    font-size: 13px;
  }
  @media (max-width: 992px) {
    font-size: 12px;
    gap: 6px;
  }
  @media (max-width: 768px) {
    font-size: 11px;
    gap: 4px;
  }
`;

export const IconWrapper = styled.div<{ $bgColor: string }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${(props) => props.$bgColor};
  display: flex !important;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  visibility: visible !important;
  opacity: 1 !important;

  .anticon,
  svg {
    font-size: 16px;
    width: 16px;
    height: 16px;
    color: white;
    fill: white;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  @media (max-width: 1200px) {
    width: 26px;
    height: 26px;
    .anticon,
    svg {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
  }
  @media (max-width: 992px) {
    width: 22px;
    height: 22px;
    .anticon,
    svg {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }
  }
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    .anticon,
    svg {
      font-size: 10px;
      width: 10px;
      height: 10px;
    }
  }
`;

const CompactModeButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(30, 30, 30, 0.4);
  border: none;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
    background: rgba(50, 50, 50, 0.7);
  }
  
  .anticon {
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Header = styled.div`
  padding: 16px 16px 0;
  
  h2 {
    margin: 0;
    color: #fff;
    font-size: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 12px 0;
    
    h2 {
      font-size: 16px;
    }
  }
`;

interface StyledTabContainerProps {
  header?: {
    title: React.ReactNode;
  };
  tabItems: TabsProps['items'];
  defaultActiveKey?: string;
  onTabClick?: (key: string) => void;
}

const StyledTabContainer: React.FC<StyledTabContainerProps> = ({
  header,
  tabItems,
  defaultActiveKey,
  onTabClick,
}) => {
  const location = useLocation();
  const { darkAlgorithm } = theme;
  const screens = Grid.useBreakpoint();
  const [isCompact, setIsCompact] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('');

  const effectiveTabPosition = screens.md ? 'left' : 'top';

  // Extract icons and text from tab items
  const processedTabItems = tabItems?.map((item) => {
    let tooltipTitle = '';
    let originalIcon: React.ReactNode = null;
    let originalText: string | null = null;

    if (
      item.label &&
      React.isValidElement(item.label) &&
      item.label.props.children
    ) {
      const children = React.Children.toArray(item.label.props.children);
      children.forEach((child) => {
        if (React.isValidElement(child)) {
          if (
            child.type === IconWrapper ||
            (typeof child.type === 'object' &&
              (child.type as any).target === IconWrapper.target)
          ) {
            originalIcon = child;
          } else if (
            child.type === 'span' &&
            typeof child.props.children === 'string'
          ) {
            originalText = child.props.children;
          }
        } else if (typeof child === 'string') {
          originalText = child;
        }
      });
      if (!originalText && typeof item.label.props.children === 'string') {
        originalText = item.label.props.children;
      }
    } else if (typeof item.label === 'string') {
      originalText = item.label;
    }

    return {
      key: item.key || '',
      icon: originalIcon,
      text: originalText || '',
      content: item.children
    };
  }) || [];

  const handleTabChange = (key: string) => {
    if (onTabClick) {
      onTabClick(key);
    }
    // Don't change active tab for special tabs like 'add-page'
    if (key !== 'add-page') {
      setActiveKey(key);
      history.replace(`#${key}`);
    }
  };

  // Initialize active key from URL hash or default
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const isValidTab = tabItems?.some((item) => item.key === hash);

    if (hash && isValidTab) {
      setActiveKey(hash);
    } else if (defaultActiveKey) {
      setActiveKey(defaultActiveKey);
      history.replace(`#${defaultActiveKey}`);
    } else if (tabItems && tabItems.length > 0 && tabItems[0].key) {
      setActiveKey(tabItems[0].key as string);
      history.replace(`#${tabItems[0].key}`);
    }
  }, [location.pathname, defaultActiveKey, tabItems]);

  // Find the active tab content
  const activeTabContent = processedTabItems.find(
    (item) => item.key === activeKey
  )?.content || null;

  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
      }}
    >
      <TabsContainer>
        <NavPanel $isCompact={isCompact && !!screens.md}>
          <CompactModeButton
            icon={isCompact ? <ExpandOutlined /> : <CompressOutlined />}
            onClick={() => setIsCompact(!isCompact)}
            title={isCompact ? 'Show labels' : 'Hide labels'}
          />
          
          {processedTabItems.map((item) => (
            <Tooltip
              title={effectiveTabPosition === 'top' || (isCompact && screens.md) ? item.text : ''}
              placement="right"
              key={item.key}
            >
              <StyledTab
                $active={activeKey === item.key}
                $isCompact={isCompact && !!screens.md}
                onClick={() => handleTabChange(item.key)}
              >
                <TabLabel $isCompact={isCompact && !!screens.md}>
                  {item.icon}
                  {<span>{item.text}</span>}
                </TabLabel>
              </StyledTab>
            </Tooltip>
          ))}
        </NavPanel>
        
        <ContentPanel>
          {header && <Header><h2>{header.title}</h2></Header>}
          {activeTabContent}
        </ContentPanel>
      </TabsContainer>
    </ConfigProvider>
  );
};

export default StyledTabContainer;
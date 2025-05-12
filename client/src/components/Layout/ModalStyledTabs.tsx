import { ConfigProvider, Tabs, TabsProps, theme, Tooltip, Grid } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { TabLabel, IconWrapper } from './StyledTabContainer';
import { ACCENT_COLORS } from '../../styles/colors';

/**
 * ModalStyledTabs
 * Props:
 * - tabItems: TabsProps['items']
 * - defaultActiveKey?: string
 * - onChange?: (key: string) => void
 */

const ModalTabsWrapper = styled.div`
  background: rgba(30, 30, 30, 0.95);
  border-radius: 14px;
  padding: 0 0 12px 0;
  .ant-tabs-nav {
    background: rgba(45, 45, 45, 0.7);
    border-radius: 10px;
    margin: 0 12px;
    padding: 6px;
    min-width: 180px;
    flex-direction: column !important;
  }
  .ant-tabs-tab {
    margin: 2px 0;
    padding: 8px 12px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.85);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    &:hover {
      background: rgba(60, 60, 60, 0.5);
    }
  }
  .ant-tabs-tab-active {
    background: rgba(60, 60, 60, 0.8) !important;
  }
  .ant-tabs-content-holder {
    padding: 18px 8px 8px 8px;
  }
`;

interface ModalStyledTabsProps {
  tabItems: TabsProps['items'];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
}

const ModalStyledTabs: React.FC<ModalStyledTabsProps> = ({
  tabItems,
  defaultActiveKey,
  onChange,
}) => {
  const { darkAlgorithm } = theme;
  const screens = Grid.useBreakpoint();

  const wrappedTabItems = tabItems?.map((item, idx) => {
    let tooltipTitle = '';
    let originalText: string | null = null;
    const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];

    // Only use the icon from the icon prop
    let iconNode = null;
    if ((item as any).icon) {
      iconNode = (
        <IconWrapper $bgColor={accentColor}>{(item as any).icon}</IconWrapper>
      );
    }

    // Extract text from label (ignore any icon in label children)
    if (typeof item.label === 'string') {
      originalText = item.label;
    } else if (React.isValidElement(item.label) && item.label.props.children) {
      const children = React.Children.toArray(item.label.props.children);
      children.forEach((child) => {
        if (typeof child === 'string') {
          originalText = child;
        } else if (
          React.isValidElement(child) &&
          typeof child.props.children === 'string'
        ) {
          originalText = child.props.children;
        }
      });
      if (!originalText && typeof item.label.props.children === 'string') {
        originalText = item.label.props.children;
      }
    }

    tooltipTitle = originalText || item.key || '';

    const newLabel = (
      <TabLabel>
        {iconNode}
        {screens.md && originalText && <span>{originalText}</span>}
      </TabLabel>
    );

    return {
      ...item,
      icon: undefined,
      label: (
        <Tooltip title={tooltipTitle} placement="right">
          {newLabel}
        </Tooltip>
      ),
    };
  });

  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        components: {
          Tabs: {
            itemSelectedColor: '#fff',
            itemHoverColor: 'rgba(255,255,255,0.85)',
            inkBarColor: 'transparent',
          },
        },
      }}
    >
      <ModalTabsWrapper>
        <Tabs
          items={wrappedTabItems}
          defaultActiveKey={defaultActiveKey}
          onChange={onChange}
          tabPosition="left"
          style={{ paddingTop: '12px' }}
        />
      </ModalTabsWrapper>
    </ConfigProvider>
  );
};

export default ModalStyledTabs;

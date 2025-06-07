import { PageContainer } from '@ant-design/pro-components';
import { ConfigProvider, TabsProps, theme, Tooltip, Grid } from 'antd';
import React, { useEffect } from 'react';
import { history, useLocation } from '@umijs/max';
import styled from 'styled-components';

const StyledPageContainer = styled(PageContainer)<{
  $tabPosition: 'left' | 'top';
}>`
  .ant-pro-page-container-tabs {
    background: rgba(30, 30, 30, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    margin: 16px;
    padding: ${(props) => (props.$tabPosition === 'left' ? '16px 0' : '0')};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-height: 80vh;
    display: flex;
    flex-direction: ${(props) =>
      props.$tabPosition === 'left' ? 'row' : 'column'};

    @media (max-width: 768px) {
      margin: 8px;
      min-height: calc(100vh - 16px);
      border-radius: 12px;
      flex-direction: column;
      padding: 16px 0 0 0;
    }
  }

  .ant-tabs-nav {
    background: rgba(45, 45, 45, 0.5);
    border-radius: 12px;
    margin: 0 16px !important;
    padding: 8px;
    min-width: 220px !important;

    @media (max-width: 1200px) {
      min-width: 200px !important;
    }
    @media (max-width: 992px) {
      min-width: 180px !important;
    }

    @media (max-width: 768px) {
      min-width: 140px !important;
      margin: 0 8px !important;
      padding: 4px;
    }

    @media (max-width: 480px) {
      min-width: 50px !important;

      .ant-tabs-tab-btn {
        padding: 0;
      }
    }
  }

  .ant-tabs-tab {
    margin: 2px 0 !important;
    padding: 8px 12px !important;
    border-radius: 8px !important;
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.85);
    width: calc(100% - 16px) !important;
    margin-left: 8px !important;
    margin-right: 8px !important;

    &:hover {
      background: rgba(60, 60, 60, 0.5);
    }

    @media (max-width: 768px) {
      padding: 6px 10px !important;
    }

    @media (max-width: 480px) {
      padding: 6px !important;
      width: calc(100% - 8px) !important;
      margin-left: 4px !important;
      margin-right: 4px !important;
    }
  }

  .ant-tabs-tab-active {
    background: rgba(60, 60, 60, 0.8) !important;
  }

  .ant-tabs-content-holder {
    padding: 24px;
    flex-grow: 1;

    @media (max-width: 768px) {
      padding: 16px;
    }

    @media (max-width: 480px) {
      padding: 8px;
    }
  }

  .ant-pro-page-container-tabs .ant-tabs-nav::before {
    display: none;
  }

  @media (max-width: 480px) {
    .ant-pro-table {
      .ant-table {
        font-size: 12px;
      }

      .ant-pro-table-search {
        padding: 16px 8px !important;

        .ant-form-item {
          margin-bottom: 12px;
        }
      }
    }
  }
`;

export const TabLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
  width: 100%;
  transition: gap 0.3s ease;
  @media (max-width: 1200px) {
    font-size: 13px;
    gap: 8px;
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
  display: flex;
  align-items: center;
  justify-content: center;

  .anticon,
  svg {
    font-size: 16px;
    width: 16px;
    height: 16px;
    color: white;
    fill: white;
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

interface StyledTabContainerProps {
  header: {
    title: React.ReactNode;
  };
  tabItems: TabsProps['items'];
  defaultActiveKey?: string;
}

const StyledTabContainer: React.FC<StyledTabContainerProps> = ({
  header,
  tabItems,
  defaultActiveKey,
}) => {
  const location = useLocation();
  const { darkAlgorithm } = theme;
  const screens = Grid.useBreakpoint();

  const effectiveTabPosition = screens.md ? 'left' : 'top';

  const wrappedTabItems = tabItems?.map((item) => {
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

    if (effectiveTabPosition === 'top') {
      tooltipTitle = originalText || item.key || '';
    }

    const newLabel = (
      <TabLabel>
        {originalIcon}
        {screens.md && originalText && <span>{originalText}</span>}
      </TabLabel>
    );

    return {
      ...item,
      label: (
        <Tooltip title={tooltipTitle} placement="bottom">
          {newLabel}
        </Tooltip>
      ),
    };
  });

  const handleTabChange = (key: string) => {
    history.replace(`#${key}`);
  };

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const isValidTab = tabItems?.some((item) => item.key === hash);

    if (hash && !isValidTab) {
      history.replace(location.pathname);
      return;
    }
  }, [location.pathname, location.hash, tabItems]);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        components: {
          Tabs: {
            itemSelectedColor: '#fff',
            itemHoverColor: 'rgba(255, 255, 255, 0.85)',
            inkBarColor: 'transparent',
          },
        },
      }}
    >
      <StyledPageContainer
        $tabPosition={effectiveTabPosition}
        header={header}
        tabList={wrappedTabItems}
        tabProps={{
          tabPosition: effectiveTabPosition,
        }}
        onTabChange={handleTabChange}
        tabActiveKey={
          location.hash.replace('#', '') ||
          defaultActiveKey ||
          tabItems?.[0]?.key ||
          ''
        }
      />
    </ConfigProvider>
  );
};

export default StyledTabContainer;

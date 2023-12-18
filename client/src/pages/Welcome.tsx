import DemoLine from '@/components/Charts/Lines';
import { ClusterOutlined, UpCircleOutlined } from '@ant-design/icons';
import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Col, Row, theme } from 'antd';
import React from 'react';
/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  const { useToken } = theme;

  const { token } = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a>
    </div>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const imgStyle = {
    display: 'block',
    width: 42,
    height: 42,
  };
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
          }}
        >
          <StatisticCard.Group direction={'row'}>
            <StatisticCard
              statistic={{
                title: 'Devices',
                value: 2,
                icon: <ClusterOutlined style={{ fontSize: '40px', color: '#08c' }} />,
              }}
            />
            <StatisticCard
              statistic={{
                title: 'Online',
                value: 475,
                icon: <UpCircleOutlined style={{ fontSize: '40px', color: 'green' }} />,
              }}
            />
            <StatisticCard
              statistic={{
                title: '成功订单数',
                value: 87,
                icon: (
                  <img
                    style={imgStyle}
                    src="https://gw.alipayobjects.com/mdn/rms_7bc6d8/afts/img/A*FPlYQoTNlBEAAAAAAAAAAABkARQnAQ"
                    alt="icon"
                  />
                ),
              }}
            />
            <StatisticCard
              statistic={{
                title: '浏览量',
                value: 1754,
                icon: (
                  <img
                    style={imgStyle}
                    src="https://gw.alipayobjects.com/mdn/rms_7bc6d8/afts/img/A*pUkAQpefcx8AAAAAAAAAAABkARQnAQ"
                    alt="icon"
                  />
                ),
              }}
            />
          </StatisticCard.Group>
        </div>
      </Card>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <Row>
          <Col span={6}>
            <DemoLine />
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default Welcome;

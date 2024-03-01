import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import { Tooltip, Typography } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import { Tiny } from '@ant-design/plots';
import React from 'react';

const ServicesCard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const rankingListData = [];
  for (let i = 0; i < 7; i += 1) {
    rankingListData.push({
      title: `test${i}`,
      total: 4 * Math.random(),
    });
  }

  const config = {
    height: 60,
    autoFit: true,
    xField: 'title',
    width: 250,
    yField: 'total',
    tooltip: { channel: 'y' },
    data: rankingListData,
    smooth: true,
  };

  return (
    <ChartCard
      bordered={false}
      loading={loading}
      title={<Typography.Title level={5}>Services Running</Typography.Title>}
      action={
        <Tooltip title={'Introduce'}>
          <InfoCircleFilled style={{ color: 'white' }} />
        </Tooltip>
      }
      total={<Typography.Title level={3}>126560</Typography.Title>}
      footer={
        <Field
          label={<Typography.Text>Daily Sales</Typography.Text>}
          value={<Typography.Text>000</Typography.Text>}
        />
      }
      contentHeight={80}
    >
      <Tiny.Column {...config} />
    </ChartCard>
  );
};

export default ServicesCard;

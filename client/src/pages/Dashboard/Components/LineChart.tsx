import React from 'react';
import { Card, Typography, Space, Select } from 'antd';
import { Tiny } from '@ant-design/plots';
import './LineChart.css';

interface LineChartProps {
  title: string;
  subtitle: string;
  incomeValue: string;
  incomeLabel: string;
  expensesValue: string;
  expensesLabel: string;
  chartData: Array<{ month: string; type: string; value: number }>;
  currentYear: number;
  availableYears: number[];
  onYearChange?: (year: number) => void;
  cardStyle?: React.CSSProperties;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  subtitle,
  incomeValue,
  incomeLabel,
  expensesValue,
  expensesLabel,
  chartData,
  currentYear,
  availableYears,
  onYearChange,
  cardStyle,
}) => {
  // Separate data for each series
  const incomeData = chartData
    .filter(d => d.type === 'Total income')
    .map((d, index) => ({ value: d.value, index }));
  
  const expensesData = chartData
    .filter(d => d.type === 'Total expenses')
    .map((d, index) => ({ value: d.value, index }));

  const incomeConfig = {
    data: incomeData,
    height: 200,
    padding: [30, 30, 30, 30],
    shapeField: 'smooth',
    xField: 'index',
    yField: 'value',
    autoFit: true,
    style: {
      stroke: '#52c41a',
      lineWidth: 4,
      shadowColor: '#52c41a',
      shadowBlur: 15,
    },
  };

  const expensesConfig = {
    data: expensesData,
    height: 200,
    padding: [30, 30, 30, 30],
    shapeField: 'smooth',
    xField: 'index',
    yField: 'value',
    autoFit: true,
    style: {
      stroke: '#faad14',
      lineWidth: 4,
      shadowColor: '#faad14',
      shadowBlur: 15,
    },
  };

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '28px 32px' }}
    >
      {/* Header with title and year selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <Typography.Title level={4} style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: 600 }}>
            {title}
          </Typography.Title>
          <Typography.Text style={{ color: '#52c41a', fontSize: '14px', opacity: 0.8 }}>
            {subtitle}
          </Typography.Text>
        </div>
        <Select
          value={currentYear}
          onChange={onYearChange}
          style={{ width: 100 }}
          options={availableYears.map(year => ({ label: year, value: year }))}
        />
      </div>

      {/* Legend with values */}
      <div style={{ display: 'flex', gap: '40px', marginTop: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#52c41a' }} />
          <div>
            <Typography.Text style={{ color: '#8a8a8a', fontSize: '13px', display: 'block' }}>
              {incomeLabel}
            </Typography.Text>
            <Typography.Title level={3} style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 600 }}>
              {incomeValue}
            </Typography.Title>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#faad14' }} />
          <div>
            <Typography.Text style={{ color: '#8a8a8a', fontSize: '13px', display: 'block' }}>
              {expensesLabel}
            </Typography.Text>
            <Typography.Title level={3} style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 600 }}>
              {expensesValue}
            </Typography.Title>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginTop: '20px', position: 'relative', height: '220px', width: '100%' }} className="line-chart-container">
        <Tiny.Line {...incomeConfig} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Tiny.Line {...expensesConfig} />
        </div>
      </div>
    </Card>
  );
};

export default LineChart;

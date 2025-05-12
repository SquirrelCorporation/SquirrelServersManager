import React from 'react';
import { Card, Typography, Space } from 'antd';
import { Column, ColumnConfig, Datum } from '@ant-design/plots';

interface VisitEntry {
  month: string;
  team: string; // More generic category
  visits: number;
}

interface WebsiteVisitsBarChartCardProps {
  title: string;
  subtitle: string;
  chartData: VisitEntry[]; // Should be flattened for grouped column chart
  // Color mapping will be done via a function in the config
  categoryColors: Record<string, string>; // e.g. { "Team A": "#5B8FF9", "Team B": "#5AD8A6" }
  cardStyle?: React.CSSProperties;
}

const WebsiteVisitsBarChartCard: React.FC<WebsiteVisitsBarChartCardProps> = ({
  title,
  subtitle,
  chartData,
  categoryColors,
  cardStyle,
}) => {
  const columnConfig: ColumnConfig = {
    data: chartData,
    isGroup: true,
    xField: 'month',
    yField: 'visits',
    seriesField: 'team', // Field to group by for color
    dodgePadding: 4, // Slightly increased dodgePadding for more space between grouped bars
    marginRatio: 0.1, // Adds some margin at the start/end of the axis for bars not to touch edges
    height: 260, // Adjusted height
    color: ({ team }: any) => categoryColors[team] || '#8c8c8c', // Default color if not found, typed team
    xAxis: {
      label: { style: { fill: '#8c8c8c', fontSize: 11 } }, // Adjusted color and size
      line: { style: { stroke: '#3a3a3e' } }, // Darker axis line
    },
    yAxis: {
      label: { style: { fill: '#8c8c8c', fontSize: 11 } }, // Adjusted color and size
      grid: { line: { style: { stroke: '#3a3a3e', lineDash: [3, 3] } } }, // Darker grid line, adjusted dash
      splitNumber: 5, // Adjust number of grid lines if needed
    },
    legend: {
      position: 'top-right',
      itemName: { style: { fill: '#d9d9d9', fontSize: 12 } }, // Lighter legend text
      marker: (name: string, index: number, item: Datum) => {
        return {
          symbol: 'square', // Ensure square marker if default is circle
          style: {
            fill: categoryColors[item.name as string] || '#8c8c8c',
            r: 5, // Size of the marker
          },
        };
      },
    },
    tooltip: {
      shared: true,
      showMarkers: false,
      domStyles: {
        'g2-tooltip': {
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
          borderRadius: '4px',
          padding: '8px 12px',
        },
      },
    },
    columnStyle: {
      radius: [3, 3, 0, 0], // Slightly adjusted radius for sharper look
    },
  };

  return (
    <Card
      style={{
        backgroundColor: '#222225', // Matched background
        borderRadius: '16px',
        color: 'white',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <Space direction="vertical" size={2} style={{ marginBottom: '20px' }}>
        {' '}
        {/* Reduced spacing */}
        <Typography.Title
          level={4}
          style={{ color: '#f0f0f0', margin: 0, fontWeight: 500 }}
        >
          {title}
        </Typography.Title>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: 13 }}>
          {subtitle}
        </Typography.Text>
      </Space>
      <Column {...columnConfig} />
    </Card>
  );
};

export default WebsiteVisitsBarChartCard;

import { ProFormSelect } from '@ant-design/pro-components';
import { Avatar, Card, Col, List, Row, Typography } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';

export type ImportantInfo = {
  icon: React.ReactNode;
  title: string | React.ReactNode;
  value: string | React.ReactNode;
  secondaryIcon?: string | React.ReactNode;
};

export type DetailInfo = {
  icon: React.ReactNode;
  key: string;
  value: string | React.ReactNode;
  color: string;
};

export type SystemInformationViewProps = {
  name: string;
  importantInfo?: ImportantInfo[];
  detailedInfo: DetailInfo[];
  options?: {
    label: string;
    value: number;
  }[];
  selectedInterface?: number;
  setSelectedInterface?: (value: any) => void;
};
const SystemInformationView: React.FC<SystemInformationViewProps> = ({
  importantInfo,
  detailedInfo,
  options,
  setSelectedInterface,
  selectedInterface,
  name,
}) => {
  // Framer Motion Variants for Animations
  const listItemVariants = {
    hidden: { opacity: 0, x: -50 }, // Start with items transparent and shifted left
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4, // Animation duration for each item
        delay: index * 0.2, // Add stagger delay based on item index
      },
    }),
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } }, // Exit animation
  };

  return (
    <Row
      gutter={16}
      style={{
        borderRadius: '8px',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      {/* Left Column: Important Info */}
      <Col
        span={8}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingRight: '32px',
        }}
      >
        {importantInfo?.map((info, index) => (
          <Card
            key={index}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Avatar
              size="large"
              icon={info.icon}
              style={{
                backgroundColor: 'rgba(190, 200, 255, 0.2)',
                padding: '8px',
              }}
            />

            {info.secondaryIcon && (
              <Avatar
                size="large"
                src={info.secondaryIcon}
                style={{
                  padding: '4px',
                  position: 'absolute', // Position it absolutely inside the Card
                  top: '8px', // Move it down slightly from the top
                  right: '8px', // Move it slightly to the left from the right
                  backgroundColor: 'rgba(190, 200, 255, 0.2)',
                  zIndex: 1, // Ensure it renders on top
                }}
              />
            )}
            <div>
              <div style={{ fontWeight: 500, fontSize: '16px' }}>
                {info.title}
              </div>
              <div style={{ fontSize: '14px', color: '#DCDCDC' }}>
                {info.value}
              </div>
            </div>
          </Card>
        ))}
      </Col>

      {/* Right Column: Detailed Info */}
      <Col
        span={16}
        style={{
          borderRadius: '8px',
          borderColor: '#e8e8e8',
          padding: '16px',
        }}
      >
        <Typography.Title style={{ marginBottom: '16px' }} level={3}>
          {name}
        </Typography.Title>
        {options && setSelectedInterface && (
          <ProFormSelect
            name={'usb'}
            fieldProps={{
              defaultValue: selectedInterface,
            }}
            onChange={(value) => setSelectedInterface(value)}
            options={options}
          />
        )}
        <List
          dataSource={detailedInfo}
          renderItem={(item, index) => (
            <motion.div
              key={`${selectedInterface}-${item.key}`}
              custom={index} // Pass the index to calculate staggered delay
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={listItemVariants}
            >
              <List.Item
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(240,240,240,0.2)',
                }}
              >
                {/* Icon and Key */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <Avatar
                    size={32}
                    icon={item.icon}
                    style={{
                      backgroundColor: item.color,
                      color: '#ffffff',
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{item.key}</span>
                </div>
                {/* Value */}
                <span>{item.value}</span>
              </List.Item>
            </motion.div>
          )}
        />
      </Col>
    </Row>
  );
};

export default SystemInformationView;

// components/StackMenu.tsx
import { Avatar, Card, Col, Divider, Row, Segmented, Space } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';
import DraggableCard from './DraggableCard';
import { ExtendedMenuElementType, MenuElementType } from './types';
import { containerVariants, itemVariants } from './utils/variants';

type StackMenuProps = {
  currentStack?: MenuElementType[];
  elementTypes: MenuElementType[];
  currentElement?: MenuElementType;
  setCurrentElement: (element?: MenuElementType) => void;
  currentMenu: ExtendedMenuElementType[];
};

const StackMenu: React.FC<StackMenuProps> = ({
  currentStack,
  elementTypes,
  currentElement,
  setCurrentElement,
  currentMenu,
}) => {
  return (
    <Card>
      <Segmented
        options={['Builder', 'Templates']}
        block
        style={{ marginBottom: 10 }}
      />
      <Segmented
        options={[
          'Main',
          ...(
            currentStack?.map((e) => {
              const children = elementTypes.find(
                (f) => f.name === e.name,
              )?.children;
              return children && children.length > 0 ? e.name : undefined;
            }) || []
          ).filter(Boolean), // This will remove any undefined values
        ]}
        block
        size="small"
        style={{ marginBottom: 10 }}
        onChange={(value) =>
          setCurrentElement(
            value === 'Main'
              ? undefined
              : elementTypes.find((e) => e.name === value),
          )
        }
        value={currentElement?.name || 'Main'}
      />
      <Divider dashed>
        {currentElement ? currentElement.name : 'Main'} Elements
      </Divider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Row
          gutter={[16, 16]}
          style={{ justifyContent: 'center', display: 'flex' }}
        >
          {(currentElement && currentElement.children
            ? currentMenu.find((e) => e.id === currentElement.id)?.children ||
              []
            : currentMenu
          )
            .filter((e: ExtendedMenuElementType) => !e.inUse)
            .map((item) => (
              <Col
                key={`${currentElement ? currentElement.id : ''}${item.name}`}
              >
                <DraggableCard id={item.id}>
                  <motion.div
                    variants={itemVariants}
                    transition={{ duration: 0.5 }}
                  >
                    <Card
                      type="inner"
                      style={{
                        width: 125,
                        textAlign: 'center',
                        cursor: 'grab',
                      }}
                    >
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ display: 'flex' }}
                      >
                        <Avatar
                          src={item.icon}
                          shape="square"
                          size="large"
                          style={{ backgroundColor: item.color }}
                        />
                        <div style={{ marginTop: '8px' }}>{item.name}</div>
                      </Space>
                    </Card>
                  </motion.div>
                </DraggableCard>
              </Col>
            ))}
        </Row>
      </motion.div>
    </Card>
  );
};

export default StackMenu;

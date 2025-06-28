import DraggableCard from '@/components/ComposeEditor/DraggableCard';
import MenuElementIcons from '@/components/ComposeEditor/Menu/MenuElementIcons';
import { MenuElementType } from '@/components/ComposeEditor/types';
import {
  containerVariants,
  itemVariants,
} from '@/components/ComposeEditor/utils/variants';
import { Avatar, Card, Col, Row, Space } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';

type StackMenuIconsGridProps = {
  elementsList: MenuElementType[];
  currentElement?: MenuElementType;
};

const StackMenuIconsGrid: React.FC<StackMenuIconsGridProps> = ({
  elementsList,
  currentElement,
}) => (
  <>
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Row
        gutter={[16, 16]}
        style={{ justifyContent: 'center', display: 'flex' }}
      >
        {(currentElement && currentElement.children
          ? elementsList.find((e) => e.id === currentElement.id)?.children || []
          : elementsList
        ).map((item) => (
          <Col key={`${currentElement ? currentElement.id : ''}${item.name}`}>
            <DraggableCard id={item.id}>
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5 }}
              >
                <Card
                  type="inner"
                  hoverable={true}
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
                      src={MenuElementIcons[item.id]?.icon}
                      shape="square"
                      size="large"
                      style={{
                        backgroundColor: MenuElementIcons[item.id]?.color,
                      }}
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
  </>
);

export default StackMenuIconsGrid;

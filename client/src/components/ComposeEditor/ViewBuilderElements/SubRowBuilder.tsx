import MenuElementIcons from '@/components/ComposeEditor/Menu/MenuElementIcons';
import {
  StackAdditionHandler,
  StackRemoveHandler,
} from '@/components/ComposeEditor/StackHandler';
import { MinusIcon } from '@/components/ComposeEditor/ViewBuilderElements/ActionsIcons';
import { ProFormInstance } from '@ant-design/pro-components';
import { Alert, Avatar } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';
import { MenuElementType } from '../types';
import { renderField } from './RenderFields';

const animationVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const buildSubRow = (
  elements: MenuElementType[],
  group: string,
  index: number,
  currentStack: MenuElementType[],
  setCurrentStack: React.Dispatch<React.SetStateAction<MenuElementType[]>>,
  path: string,
  form: ProFormInstance,
) => {
  const handleDelete = (element: MenuElementType) => {
    const updatedStack = StackRemoveHandler(
      element.id,
      element.id,
      currentStack,
      index,
      group,
    );
    setCurrentStack(updatedStack);
  };

  if (!elements || (elements.length === 0 && group === 'services')) {
    return (
      <Alert
        style={{ width: '100%' }}
        message={'Tips'}
        type={'info'}
        showIcon
        description={
          <>
            A service requires an <b>image</b>{' '}
            <Avatar
              src={MenuElementIcons.image.icon}
              size="large"
              shape={'square'}
              style={{
                cursor: 'pointer',
                backgroundColor: MenuElementIcons.image.color,
              }}
              onClick={() => {
                setCurrentStack(
                  StackAdditionHandler(
                    group,
                    'image',
                    currentStack,
                    index,
                    group,
                  ),
                );
              }}
            />{' '}
            or a <b>build context</b>{' '}
            <Avatar
              src={MenuElementIcons.build.icon}
              size="large"
              shape={'square'}
              style={{
                cursor: 'pointer',
                backgroundColor: MenuElementIcons.build.color,
              }}
              onClick={() => {
                setCurrentStack(
                  StackAdditionHandler(
                    group,
                    'build',
                    currentStack,
                    index,
                    group,
                  ),
                );
              }}
            />{' '}
          </>
        }
      />
    );
  }

  return elements?.map((element, idx) => (
    <motion.div
      key={`${element.id}-${idx}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={animationVariants}
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
        <MinusIcon onClick={() => handleDelete(element)} />
      </div>
      {renderField(element, index, [group, path], currentStack, form)}
    </motion.div>
  ));
};

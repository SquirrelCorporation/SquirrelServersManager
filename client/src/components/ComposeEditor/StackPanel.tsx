// components/StackPanel.tsx
import { Templates } from '@/components/ComposeEditor/Menu/MenuTemplateElements';
import {
  StackIcon,
  StackIconSelector,
} from '@/components/ComposeEditor/StackIconSelector';
import { generateId } from '@/components/ComposeEditor/utils/id';
import generateReadableName from '@/components/ComposeEditor/utils/random-names';
import { DragDrop2 } from '@/components/Icons/CustomIcons';
import {
  ProForm,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { ProFormGroup } from '@ant-design/pro-form';
import { Button, Card, Collapse, Space, Typography } from 'antd';
import React from 'react';
import DroppableArea from './DroppableArea';
import { MenuElementType } from './types';
import { buildView } from './ViewBuilder';

type StackPanelProps = {
  currentStack?: MenuElementType[];
  elementTypes: MenuElementType[];
  setCurrentElement: (element?: MenuElementType) => void;
  setCurrentStack: any;
  formRef: ProFormInstance;
  stackIcon: {
    icon: string;
    iconColor: string;
    iconBackgroundColor: string;
  };
  setStackIcon: any;
  onClickSaveStack: () => void;
};

const StackPanel: React.FC<StackPanelProps> = ({
  currentStack,
  elementTypes,
  setCurrentElement,
  setCurrentStack,
  formRef,
  stackIcon,
  setStackIcon,
  onClickSaveStack,
}) => {
  return (
    <Card>
      <ProForm
        grid
        form={formRef}
        submitter={{
          submitButtonProps: { children: 'Save' },
          render: () => (
            <div style={{ textAlign: 'right', width: '100%' }}>
              <Space>
                <Button key="reset" onClick={() => formRef?.resetFields()}>
                  Reset
                </Button>
                <Button type="primary" key="submit" onClick={onClickSaveStack}>
                  Save
                </Button>
              </Space>
            </div>
          ),
        }}
      >
        <ProFormGroup
          colProps={{ span: 24 }}
          grid
          rowProps={{
            gutter: [16, 0],
          }}
        >
          <ProFormText
            colProps={{ span: 18 }}
            name={'name'}
            label={'Stack name'}
            initialValue={generateReadableName()}
            rules={[{ required: true, message: 'Please enter a name' }]}
            fieldProps={{
              addonBefore: (
                <StackIconSelector
                  stackIcon={stackIcon}
                  setStackIcon={setStackIcon}
                >
                  <>
                    {' '}
                    <StackIcon stackIcon={stackIcon} />
                  </>
                </StackIconSelector>
              ),
            }}
          />

          <ProFormText
            colProps={{ span: 6 }}
            name={'version'}
            label={'Version'}
            tooltip={
              "Docker Compose version. The top-level version property is defined by the Compose Specification for backward compatibility. It is only informative and you'll receive a warning message that it is obsolete if used."
            }
          />
        </ProFormGroup>
        <ProFormGroup colProps={{ span: 24 }}>
          {currentStack && currentStack.length > 0 && (
            <Collapse
              expandIcon={() => null}
              collapsible={'header'}
              style={{ marginBottom: 40, width: '100%' }}
              size={'small'}
              activeKey={currentStack?.map((e, index) => generateId(e, index))}
              items={currentStack.map((e, index) =>
                buildView(
                  e,
                  setCurrentElement,
                  index,
                  setCurrentStack,
                  currentStack,
                  formRef,
                ),
              )}
            />
          )}
        </ProFormGroup>
        <ProFormGroup
          colProps={{ span: 24 }}
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <DroppableArea
            id={'main'}
            allowedDraggables={[
              ...elementTypes.map((e) => e.id),
              ...Templates.map((e) => e.id),
            ]}
          >
            <div
              style={{
                height:
                  currentStack && currentStack.length > 0 ? '10vh' : '20vh',
                width: '100%',

                border: '1px dashed #424242',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentElement(undefined)}
            >
              <Space
                direction={'vertical'}
                size={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 5,
                  marginBottom: 5,
                }}
              >
                <DragDrop2 style={{ fontSize: '24px' }} />
                <Typography.Text>Drop Main Elements Here</Typography.Text>
              </Space>
            </div>
          </DroppableArea>
        </ProFormGroup>
      </ProForm>
    </Card>
  );
};

export default StackPanel;

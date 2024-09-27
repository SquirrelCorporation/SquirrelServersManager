import MenuElementIcons from '@/components/ComposeEditor/Menu/MenuElementIcons';
import {
  StackAdditionHandler,
  StackRemoveHandler,
} from '@/components/ComposeEditor/StackHandler';
import { MenuElementType } from '@/components/ComposeEditor/types';
import { generateId } from '@/components/ComposeEditor/utils/id';
import {
  AddIcon,
  RemoveIcon,
} from '@/components/ComposeEditor/ViewBuilderElements/ActionsIcons';
import CollapseContent from '@/components/ComposeEditor/ViewBuilderElements/CollapseContent';
import { Link } from '@/components/Icons/CustomIcons';
import {
  ProFormDependency,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { Avatar, Collapse, Popconfirm, Space, Tag, Tooltip } from 'antd';
import React from 'react';

export const buildView = (
  element: MenuElementType,
  setCurrentElement: (element?: MenuElementType) => void,
  index: number,
  setCurrentStack: React.Dispatch<React.SetStateAction<MenuElementType[]>>,
  currentStack: MenuElementType[],
  form: ProFormInstance,
) => {
  const icon = MenuElementIcons[element.id]?.icon;

  return {
    key: generateId(element, index),
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          // @ts-ignore
          src={React.cloneElement(icon, {
            style: { fontSize: '16px', color: 'whitesmoke' },
          })}
          style={{ backgroundColor: MenuElementIcons[element.id]?.color }}
          shape={'square'}
          size={'small'}
        />{' '}
        <span style={{ marginLeft: '8px' }}>{element.name}</span>
      </div>
    ),
    extra: (
      <Space direction={'horizontal'}>
        <Tooltip title={`Add a new ${element.name}`}>
          <AddIcon
            onClick={() => {
              const updatedStack = StackAdditionHandler(
                'main',
                element.id,
                currentStack,
                index,
                element.id,
              );
              setCurrentStack(updatedStack);
            }}
          />
        </Tooltip>
        <Popconfirm
          arrow={true}
          title="Delete the block"
          description="Are you sure to delete this block?"
          onConfirm={() => {
            const updatedStack = StackRemoveHandler(
              'main',
              element.id,
              currentStack,
              element.index,
              element.id,
            );
            setCurrentStack(updatedStack);
            setCurrentElement(undefined);
          }}
          okText="Yes"
          cancelText="No"
        >
          <RemoveIcon onClick={() => {}} />
        </Popconfirm>
      </Space>
    ),
    children: element.children?.map((childElement) => (
      <Collapse
        size={'small'}
        key={generateId(childElement, childElement.index as number)}
        style={{ marginBottom: 5 }}
        items={[
          {
            label: (
              <ProFormText
                noStyle
                width={'sm'}
                name={[childElement.id, childElement.path, 'name']}
                style={{ width: '20%' }}
                placeholder={`${childElement.name} ${childElement.index}`}
                fieldProps={{
                  size: 'small',
                  onClick: (event) => event?.stopPropagation(),
                }}
                rules={[
                  {
                    required: true,
                    message: 'Please enter a name',
                  },
                ]}
                initialValue={
                  childElement.isTemplate ? childElement.originalId : null
                }
              />
            ),
            key: generateId(childElement, childElement.index as number),
            children: (
              <CollapseContent
                element={childElement}
                setCurrentElement={setCurrentElement}
                currentStack={currentStack}
                setCurrentStack={setCurrentStack}
                index={childElement.index as number}
                path={childElement.path as string}
                form={form}
              />
            ),
            extra: (
              <>
                <ProFormDependency name={[childElement.id, childElement.path]}>
                  {({ services }) => (
                    <>
                      {services?.[childElement.path as string]?.depends_on?.map(
                        (dep: any) => (
                          <Tag
                            icon={<Link />}
                            key={dep}
                            color={'#f50'}
                            style={{ cursor: 'default' }}
                          >
                            {dep}
                          </Tag>
                        ),
                      )}
                    </>
                  )}
                </ProFormDependency>
                <RemoveIcon
                  onClick={() => {
                    const updatedStack = StackRemoveHandler(
                      'main',
                      childElement.id,
                      currentStack,
                      childElement.index,
                      element.id,
                    );
                    setCurrentStack(updatedStack);
                    setCurrentElement(undefined);
                  }}
                />
              </>
            ),
          },
        ]}
        defaultActiveKey={generateId(
          childElement,
          childElement.index as number,
        )}
      />
    )),
  };
};

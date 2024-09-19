// utils/ViewUtils.ts
import DroppableArea from '@/components/ComposeEditor/DroppableArea';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ProFormCheckbox,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Avatar, Collapse, Input, Space, Typography } from 'antd';
import { DeleteOutline } from 'antd-mobile-icons';
import React from 'react';
import { MenuElementType } from './types';

const renderLabelWithIcon = (label: string, icon: any, color?: string) => (
  <span style={{ marginBottom: 5 }}>
    <Avatar
      size={'small'}
      src={React.cloneElement(icon, {
        style: { fontSize: '16px', color: 'whitesmoke' },
      })}
      style={{ backgroundColor: color, marginRight: 5 }}
    />
    {label}
  </span>
);

const renderField = (field: Partial<MenuElementType>, index: number) => {
  const labelWithIcon =
    field.name && field.icon
      ? renderLabelWithIcon(field.name, field.icon, field.color)
      : field.name;

  switch (field.fieldType) {
    case 'text':
      return <ProFormText key={index} name={field.id} label={labelWithIcon} />;
    case 'url':
      return (
        <ProFormText
          key={index}
          name={field.id}
          label={labelWithIcon}
          rules={[{ type: 'url' }]}
        />
      );
    case 'textArea':
      return (
        <ProFormTextArea key={index} name={field.id} label={labelWithIcon} />
      );
    case 'select':
      return (
        <ProFormSelect
          key={index}
          name={field.id}
          label={labelWithIcon}
          options={field.selectOptions?.map((opt) => ({
            value: opt,
            label: opt,
          }))}
        />
      );
    case 'checkbox':
      return (
        <ProFormCheckbox key={index} name={field.id}>
          {labelWithIcon}
        </ProFormCheckbox>
      );
    case 'checkboxGroup':
      return (
        <ProFormCheckbox.Group
          key={index}
          name={field.id}
          label={labelWithIcon}
          options={field.selectOptions}
        />
      );
    case 'number':
      return (
        <ProFormText
          key={index}
          name={field.id}
          label={labelWithIcon}
          rules={[{ type: 'number' }]}
        />
      );
    case 'list':
      return (
        <ProFormList
          key={index}
          name={field.id as string}
          label={labelWithIcon}
          creatorButtonProps={{
            icon: <PlusOutlined />,
            type: 'dashed',
            creatorButtonText: `Add ${field.name}`,
          }}
          copyIconProps={false}
        >
          {(meta) => {
            return (
              <Space key={meta.key} align="baseline">
                {field.listItemType === 'text' && (
                  <ProFormText name={meta.name} />
                )}
                {field.listItemType === 'url' && (
                  <ProFormText name={meta.name} rules={[{ type: 'url' }]} />
                )}
                {field.listItemType === 'select' && (
                  <ProFormSelect
                    name={meta.name}
                    options={field.selectOptions?.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))}
                  />
                )}
                {field.listItemType === 'group' &&
                  (field.fields || []).map((childField, idx) =>
                    renderField(
                      {
                        ...childField,
                        id: [meta.name, childField.id].flat(),
                        name: childField.name,
                      },
                      idx,
                    ),
                  )}
              </Space>
            );
          }}
        </ProFormList>
      );
    case 'group':
      return (
        <ProFormGroup
          key={index}
          title={labelWithIcon}
          size={'small'}
          titleStyle={{ marginBottom: 10 }}
        >
          {field.fields?.map((childField, idx) => renderField(childField, idx))}
        </ProFormGroup>
      );
    case 'object':
      return (
        <ProFormGroup
          key={index}
          title={labelWithIcon}
          size={'small'}
          titleStyle={{ marginBottom: 5 }}
        >
          {field.fields?.map((childField, idx) => renderField(childField, idx))}
        </ProFormGroup>
      );
    default:
      return null;
  }
};

export const buildSubView = (elements?: MenuElementType[]) => {
  const handleDelete = (index: number) => {
    // Implement your delete logic here
    console.log(`Delete item at index: ${index}`);
  };

  return elements?.map((element, index) => (
    <div
      key={element.id}
      style={{
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
        <MinusCircleOutlined
          onClick={() => handleDelete(index)}
          style={{ cursor: 'pointer', fontSize: '18px' }}
        />
      </div>
      {renderField(element, index)}
    </div>
  ));
};

const RemoveIcon: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <DeleteOutline
      onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
        alert('delete');
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ color: isHovered ? 'darkgray' : 'inherit' }}
    />
  );
};

const buildView = (
  e: MenuElementType,
  setCurrentElement: (element?: MenuElementType) => void,
  elementTypes: MenuElementType[],
) => {
  const children = elementTypes.find((f) => f.id === e.id)?.children;

  const content = (
    <>
      {(children && children.length > 0 && (
        <DroppableArea
          id={e.id}
          allowedDraggables={children.map((f: MenuElementType) => f.id)}
        >
          <div
            style={{
              width: '100%',
              minHeight: '10vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div id={e.id} style={{ width: '100%', height: '100%' }}>
              {buildSubView(e.children)}
            </div>
          </div>
          <div
            id={e.id}
            style={{
              height: '3vh',
              width: '100%',
              marginTop: 10,
              border: '1px dashed #424242',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              display: 'flex', // Add Flexbox
              justifyContent: 'center', // Center horizontally
              alignItems: 'center', // Center vertically
              cursor: 'pointer',
            }}
            onClick={(mouseEvent) => {
              const hoverElement = elementTypes.find(
                (f) => f.id === mouseEvent.currentTarget.id,
              );
              if (hoverElement?.children && hoverElement.children.length > 0) {
                setCurrentElement(hoverElement);
              }
            }}
          >
            <Typography.Text>Drop {e.name} Elements Here</Typography.Text>
          </div>
        </DroppableArea>
      )) || (
        <div id={e.id} style={{ width: '100%', height: '100%' }}>
          {renderField(e, 1)}
        </div>
      )}
    </>
  );

  return {
    key: e.id,
    label: e.name,
    extra: <RemoveIcon />,
    children: e.multiple ? (
      <Collapse
        items={[
          {
            label: (
              <Input
                name={'service'}
                size={'small'}
                style={{ width: '20%' }}
                placeholder={'Service 1'}
                onClick={(g) => g.stopPropagation()}
              />
            ),
            key: 'service',
            children: content,
            extra: <RemoveIcon />,
          },
        ]}
        defaultActiveKey={'service'}
      />
    ) : (
      content
    ),
  };
};

export { buildView };

import {
  SmartSelect,
  SmartSelectSingle,
} from '@/components/ComposeEditor/ViewBuilderElements/SmartFields';
import { PlusOutlined } from '@ant-design/icons';
import { ProFormInstance } from '@ant-design/pro-components';
import {
  ProFormCheckbox,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Space } from 'antd';
import React from 'react';
import { Field, MenuElementType } from '../types';
import { renderLabelWithIcon } from './LabelUtils';

const mapFieldsToInitialValues = (fields: Partial<Field>[], index: number) => {
  return fields.reduce(
    (acc, field) => {
      acc[field.id as string] = Array.isArray(field.value)
        ? field.value[index]
        : field.value;
      return acc;
    },
    {} as Record<string, any>,
  );
};

const generateListInitialValue = (fields: Partial<Field>[]) => {
  // Determine the maximum length of value arrays in the fields
  const maxLength = Math.max(
    ...fields.map((field) =>
      Array.isArray(field.value) ? field.value.length : 1,
    ),
  );

  // If no fields have array values, return an empty array
  if (maxLength <= 0) return [];

  // Create initial values array with mapped field initial values for each item
  return Array(maxLength)
    .fill(null)
    .map((_, idx) => mapFieldsToInitialValues(fields, idx));
};

export const renderField = (
  field: Partial<MenuElementType>,
  index: number,
  namePath: (string | number)[] = [],
  currentStack: MenuElementType[],
  form: ProFormInstance,
) => {
  const labelWithIcon = renderLabelWithIcon(
    field.name as string,
    field.id as string,
  );

  // Handle SmartFields
  switch (field.id) {
    case 'depends_on':
    case 'service-configs':
    case 'service-networks':
      return (
        <>
          <SmartSelect
            id={field.id}
            name={[...namePath, field.id as string]}
            index={index}
            initialValue={field.value}
            form={form}
            labelWithIcon={labelWithIcon}
          />
        </>
      );
    case 'image':
      return (
        <SmartSelectSingle
          id={field.id}
          name={[...namePath, field.id as string]}
          index={index}
          initialValue={field.value}
          form={form}
          labelWithIcon={labelWithIcon}
        />
      );
  }
  switch (field.fieldType) {
    case 'text':
      return (
        <ProFormText
          key={index}
          name={[...namePath, field.id as string]}
          label={labelWithIcon}
          initialValue={field.value}
        />
      );
    case 'url':
      return (
        <ProFormText
          key={index}
          name={[...namePath, field.id as string]}
          label={labelWithIcon}
          rules={[{ type: 'url' }]}
          initialValue={field.value}
        />
      );
    case 'textArea':
      return (
        <ProFormTextArea
          key={index}
          name={[...namePath, field.id as string]}
          label={labelWithIcon}
          initialValue={field.value}
        />
      );
    case 'select':
      return (
        <ProFormSelect
          key={index}
          name={[...namePath, field.id as string]}
          label={labelWithIcon}
          options={field.selectOptions?.map((opt) => ({
            value: opt,
            label: opt,
          }))}
          initialValue={field.value}
        />
      );
    case 'checkbox':
      return (
        <ProFormCheckbox
          key={index}
          name={[...namePath, field.id as string]}
          initialValue={field.value}
        >
          {labelWithIcon}
        </ProFormCheckbox>
      );
    case 'checkboxGroup':
      return (
        <ProFormCheckbox.Group
          key={index}
          name={[...namePath, field.id as string]}
          label={labelWithIcon}
          options={field.selectOptions}
          initialValue={field.value}
        />
      );
    case 'number':
      return (
        <ProFormDigit
          key={index}
          name={[...namePath, field.id as string]}
          label={labelWithIcon}
          fieldProps={{ precision: 0 }}
          initialValue={field.value}
        />
      );
    case 'list':
      return (
        <ProFormList<Field>
          key={index}
          name={[...namePath, field.id as string]}
          label={labelWithIcon}
          creatorButtonProps={{
            icon: <PlusOutlined />,
            type: 'dashed',
            creatorButtonText: `Add ${field.name}`,
          }}
          copyIconProps={false}
          initialValue={generateListInitialValue(field.fields || [])}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
          {(meta, index) => (
            <Space key={meta.key} align="baseline">
              {field.listItemType === 'text' && (
                <ProFormText
                  name={Array.isArray(meta.name) ? [...meta.name] : []}
                />
              )}
              {field.listItemType === 'number' && (
                <ProFormDigit
                  fieldProps={{ precision: 0 }}
                  name={Array.isArray(meta.name) ? [...meta.name] : []}
                />
              )}
              {field.listItemType === 'url' && (
                <ProFormText
                  name={Array.isArray(meta.name) ? [...meta.name] : []}
                  rules={[{ type: 'url' }]}
                />
              )}
              {field.listItemType === 'select' && (
                <ProFormSelect
                  name={Array.isArray(meta.name) ? [...meta.name] : []}
                  options={field.selectOptions?.map((opt) => ({
                    value: opt,
                    label: opt,
                  }))}
                />
              )}
              {/* Handle nested group fields in list */}
              {field.listItemType === 'group' &&
                (field.fields || []).map((childField, idx) => (
                  <>
                    {renderField(
                      {
                        ...childField,
                        id: `${childField.id}`,
                        name: childField.name,
                        value: childField.value?.[index],
                      },
                      idx,
                      [],
                      currentStack,
                      form,
                    )}
                  </>
                ))}
            </Space>
          )}
        </ProFormList>
      );
    case 'group':
      return (
        <ProFormGroup
          key={index}
          colProps={{ span: 24 }}
          title={labelWithIcon}
          size="small"
          titleStyle={{ marginBottom: 10 }}
        >
          {field.fields?.map((childField, idx) =>
            renderField(
              childField,
              idx,
              [...namePath, field.id as string],
              currentStack,
              form,
            ),
          )}
        </ProFormGroup>
      );
    case 'object':
      return (
        <ProFormGroup
          key={index}
          colProps={{ span: 24 }}
          title={labelWithIcon}
          size="small"
          titleStyle={{ marginBottom: 5 }}
        >
          {field.fields?.map((childField, idx) =>
            renderField(
              childField,
              idx,
              [...namePath, field.id as string],
              currentStack,
              form,
            ),
          )}
        </ProFormGroup>
      );
    default:
      return null;
  }
};

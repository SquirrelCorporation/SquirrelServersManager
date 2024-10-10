import { getImages, getNetworks } from '@/services/rest/services';
import {
  ProForm,
  ProFormInstance,
  ProFormItem,
} from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { AutoComplete, Space, Tag } from 'antd';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

type SmartFieldsProps = {
  id: string;
  index: number;
  name: (string | number)[];
  initialValue: any;
  form: ProFormInstance;
  labelWithIcon: ReactNode;
};

export const SmartSelect: React.FC<SmartFieldsProps> = ({
  id,
  name,
  index,
  initialValue,
  form,
  labelWithIcon,
}) => {
  const [contextNames, setContextNames] = useState<
    { origin: string; value: string }[]
  >([]);

  const extractContextNames = useCallback(async () => {
    const values = form.getFieldsValue();
    switch (id) {
      case 'depends_on':
        if (values && values.services) {
          const names = Object.values(values.services).map((service: any) => {
            return { origin: 'This stack', value: service.name };
          });
          setContextNames(names);
        }
        return;
      case 'service-configs':
        if (values && values.configs) {
          const names = Object.values(values.configs).map((config: any) => {
            return { origin: 'This stack', value: config.name };
          });
          setContextNames(names);
        }
        return;
      case 'service-networks':
        const names =
          values.networks && values.networks
            ? Object.values(values.networks).map((network: any) => {
                return { origin: 'This stack', value: network.name };
              })
            : [];
        const networksData = await getNetworks();
        const uniqueNamesMap: Map<
          string,
          { origin: string; value: string | undefined }
        > = new Map();
        networksData?.data?.forEach((e) => {
          if (!uniqueNamesMap.has(e.name)) {
            const nameObject = {
              origin: e.device?.ip || 'unknown',
              value: e.name,
            };
            uniqueNamesMap.set(e.name, nameObject);
          } else {
            const nameObject = {
              origin: 'On multiple devices',
              value: e.name,
            };
            uniqueNamesMap.set(e.name, nameObject);
          }
        });
        names.push(...Array.from(uniqueNamesMap.values()));
        setContextNames(names);
    }

    return [];
  }, [form]);

  useEffect(() => {
    void extractContextNames(); // Extract names on mount
  }, [form, extractContextNames]);

  return (
    <>
      <ProFormSelect
        label={labelWithIcon}
        mode={'tags'}
        key={index}
        name={name}
        options={contextNames.map((contextName) => ({
          label: contextName.value,
          value: contextName.value,
          origin: contextName.origin,
        }))}
        fieldProps={{
          optionRender: (option) => (
            <Space>
              <span role="img" aria-label={option.data.label as string}>
                <Tag>{option.data.origin}</Tag>
              </span>
              {option.data.label}
            </Space>
          ),
          onClick: () => extractContextNames(),
        }}
        initialValue={initialValue}
      />
    </>
  );
};

export const SmartSelectSingle: React.FC<SmartFieldsProps> = ({
  id,
  name,
  index,
  initialValue,
  form,
  labelWithIcon,
}) => {
  const [contextNames, setContextNames] = useState<
    { origin: string; value: string }[]
  >([]);

  const extractContextNames = useCallback(async () => {
    const values = form.getFieldsValue();
    switch (id) {
      case 'image':
        const imagesData = await getImages();
        const uniqueNamesMap: Map<string, { origin: string; value: string }> =
          new Map();
        imagesData?.data?.forEach((e) => {
          e.repoTags?.forEach((f) => {
            if (!uniqueNamesMap.has(f)) {
              const nameObject = {
                origin: e.device?.ip || 'unknown',
                value: f,
              };
              uniqueNamesMap.set(f, nameObject);
            } else {
              const nameObject = {
                origin: 'On multiple devices',
                value: f,
              };
              uniqueNamesMap.set(f, nameObject);
            }
          });
        });
        setContextNames(Array.from(uniqueNamesMap.values()));
    }

    return [];
  }, [form]);

  useEffect(() => {
    void extractContextNames(); // Extract names on mount
  }, [form, extractContextNames]);

  return (
    <ProFormItem name={name} label={labelWithIcon}>
      <AutoComplete
        key={index}
        options={contextNames.map((contextName) => ({
          label: (
            <Space>
              <span role="img" aria-label={contextName.value as string}>
                <Tag>{contextName.origin}</Tag>
              </span>
              {contextName.value}
            </Space>
          ),
          value: contextName.value,
        }))}
        onClick={() => extractContextNames()}
        defaultValue={initialValue}
      />
    </ProFormItem>
  );
};

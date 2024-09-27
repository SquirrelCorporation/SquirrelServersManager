import { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

type SmartFieldsProps = {
  id: string;
  index: number;
  name: (string | number)[];
  initialValue: any;
  form: ProFormInstance;
  labelWithIcon: ReactNode;
};

export const ContextSelect: React.FC<SmartFieldsProps> = ({
  id,
  name,
  index,
  initialValue,
  form,
  labelWithIcon,
}) => {
  const [contextNames, setContextNames] = useState<string[]>([]);

  const extractContextNames = useCallback(() => {
    const values = form.getFieldsValue();
    switch (id) {
      case 'depends_on':
        if (values && values.services) {
          const names = Object.values(values.services).map(
            (service: any) => service.name,
          );
          setContextNames(names);
        }
        return;
      case 'service-configs':
        if (values && values.configs) {
          const names = Object.values(values.configs).map(
            (config: any) => config.name,
          );
          setContextNames(names);
        }
        return;
      case 'service-networks':
        if (values && values.networks) {
          const names = Object.values(values.networks).map(
            (network: any) => network.name,
          );
          setContextNames(names);
        }
        return;
    }

    return [];
  }, [form]);

  useEffect(() => {
    extractContextNames(); // Extract names on mount
  }, [form, extractContextNames]);

  return (
    <>
      <ProFormSelect
        label={labelWithIcon}
        mode={'tags'}
        key={index}
        name={name}
        options={contextNames.map((contextName) => ({
          label: contextName,
          value: contextName,
        }))}
        fieldProps={{
          onClick: () => extractContextNames(),
        }}
        initialValue={initialValue}
      />
    </>
  );
};

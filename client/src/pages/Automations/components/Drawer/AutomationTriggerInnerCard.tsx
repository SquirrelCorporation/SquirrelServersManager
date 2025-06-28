import { TablerSquareNumber1Filled } from '@shared/ui/icons/categories/ui';
import AutomationActionTitle from '@/pages/Automations/components/Drawer/AutomationActionTitle';
import { CheckCircleFilled, ClockCircleFilled } from '@ant-design/icons';
import {
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Card, Form, Space } from 'antd';
import { FormInstance } from 'antd/lib';
import React, { useEffect } from 'react';
import Cron from 'react-js-cron';

const options = [{ label: 'Cron', value: 'cron', icon: <ClockCircleFilled /> }];

type AutomationTriggerInnerCardProps = {
  formRef: FormInstance<any>;
};

const AutomationTriggerInnerCard: React.FC<AutomationTriggerInnerCardProps> = (
  props,
) => {
  const newCronValue = Form.useWatch('cronValue', props.formRef);

  const [cronValue, setCronValue] = React.useState(
    props.formRef?.getFieldValue('cronValue') !== ''
      ? props.formRef?.getFieldValue('cronValue')
      : '0 * * * *',
  );
  useEffect(() => {
    if (props.formRef?.getFieldValue('cronValue') !== cronValue) {
      props.formRef?.setFieldValue?.('cronValue', cronValue);
    }
  }, [cronValue, props.formRef]);

  useEffect(() => {
    if (newCronValue && newCronValue !== cronValue) {
      setCronValue(newCronValue);
    }
  }, [newCronValue]);

  return (
    <Card
      type="inner"
      title={
        <AutomationActionTitle
          title={'Trigger'}
          icon={
            <TablerSquareNumber1Filled
              style={{ fontSize: '25px', marginTop: 3 }}
            />
          }
        />
      }
    >
      <ProFormSelect
        name="trigger"
        width="xl"
        rules={[
          {
            required: true,
          },
        ]}
        tooltip="The triggering event - Only cron based for now"
        placeholder="Choose a trigger event"
        options={options}
        fieldProps={{
          menuItemSelectedIcon: <CheckCircleFilled />,
          labelRender: (values) => (
            <Space>
              <span role="img" aria-label={values.label as string}>
                {options.find((option) => option.value === values.value)?.icon}{' '}
              </span>
              {values.label}
            </Space>
          ),
          optionRender: (option) => (
            <Space>
              <span role="img" aria-label={option.data.label as string}>
                {option.data.icon}
              </span>
              {option.data.label}
            </Space>
          ),
        }}
      />
      <ProFormDependency name={['trigger']}>
        {({ trigger }) => {
          if (trigger === 'cron') {
            return (
              <>
                <ProFormText
                  name={'cronValue'}
                  initialValue={cronValue}
                  disabled
                />
                <Cron
                  key={'1'}
                  value={cronValue}
                  setValue={setCronValue}
                  clearButton={false}
                />
              </>
            );
          }
        }}
      </ProFormDependency>
    </Card>
  );
};

export default AutomationTriggerInnerCard;

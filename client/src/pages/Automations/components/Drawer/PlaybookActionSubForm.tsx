import ExtraVarView from '@/components/PlaybookSelection/ExtraVarView';
import { getDevices } from '@/services/rest/device';
import { getPlaybooks } from '@/services/rest/playbooks';
import { CheckCircleFilled, FileOutlined, LockFilled } from '@ant-design/icons';
import { ProFormSelect } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { Collapse, Space } from 'antd';
import { FormInstance } from 'antd/lib';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

type PlaybookActionSubFormProps = {
  setOverrideExtraVars: any;
  overrideExtraVars: any;
  formRef: FormInstance<any>;
};

const PlaybookActionSubForm: React.FC<PlaybookActionSubFormProps> = (props) => {
  const newPlaybookValue = ProForm.useWatch('playbook', props.formRef);
  const [listOfPlaybooks, setListOfPlaybooks] = React.useState<
    API.PlaybookFile[] | undefined
  >();
  const [selectedPlaybookExtraVars, setSelectedPlaybookExtraVars] =
    React.useState<any>();

  useEffect(() => {
    if (newPlaybookValue) {
      const selectedPlaybook = listOfPlaybooks?.find(
        (e) => e.uuid === newPlaybookValue.value,
      );
      if (selectedPlaybook) {
        props.setOverrideExtraVars(
          selectedPlaybook.extraVars?.map((e) => {
            return { overrideVar: e.extraVar };
          }),
        );
        const reservedVars =
          (selectedPlaybook.extraVars &&
            selectedPlaybook.extraVars.length > 0 &&
            selectedPlaybook.extraVars.filter((e) => e.extraVar.startsWith('_'))
              .length > 0 &&
            selectedPlaybook.extraVars.filter((e) =>
              e.extraVar.startsWith('_'),
            )) ||
          undefined;
        const customVars =
          (selectedPlaybook.extraVars &&
            selectedPlaybook.extraVars.length > 0 &&
            selectedPlaybook.extraVars.filter(
              (e) => !e.extraVar.startsWith('_'),
            ).length > 0 &&
            selectedPlaybook.extraVars.filter(
              (e) => !e.extraVar.startsWith('_'),
            )) ||
          undefined;
        setSelectedPlaybookExtraVars([
          {
            key: 'reserved-vars',
            label: 'Reserved ExtraVars',
            children:
              reservedVars?.map((e) => (
                <ExtraVarView
                  key={e.extraVar}
                  extraVar={e}
                  setOverrideExtraVars={props.setOverrideExtraVars}
                  overrideExtraVars={props.overrideExtraVars}
                />
              )) || 'NONE',
          },
          {
            key: 'custom-vars',
            label: 'ExtraVars',
            children:
              customVars?.map((e) => (
                <ExtraVarView
                  key={e.extraVar}
                  extraVar={e}
                  setOverrideExtraVars={props.setOverrideExtraVars}
                  overrideExtraVars={props.overrideExtraVars}
                />
              )) || 'NONE',
          },
        ]);
      } else {
        setSelectedPlaybookExtraVars(undefined);
      }
    }
  }, [newPlaybookValue, listOfPlaybooks]);

  return (
    <>
      <ProFormSelect.SearchSelect
        name="playbook"
        placeholder={'Select a playbook'}
        fieldProps={{
          menuItemSelectedIcon: <CheckCircleFilled />,
          labelRender: (props) => (
            <Space>
              <span role="img" aria-label={props.label as string}>
                <FileOutlined />
              </span>
              {props.label}
            </Space>
          ),
          optionRender: (option) => (
            <Space>
              <span role="img" aria-label={option.data.label as string}>
                {(option.data.label as string).startsWith('_') ? (
                  <LockFilled />
                ) : (
                  <FileOutlined />
                )}
              </span>
              {option.data.label}
            </Space>
          ),
          mode: undefined,
          style: {
            minWidth: 240,
          },
        }}
        rules={[
          {
            required: true,
          },
        ]}
        request={async () => {
          return await getPlaybooks().then((response) => {
            setListOfPlaybooks(response.data);
            return response.data.map((e) => {
              return { label: e.name, value: e.uuid };
            });
          });
        }}
      />
      {selectedPlaybookExtraVars && (
        <Collapse
          items={selectedPlaybookExtraVars}
          bordered={false}
          style={{ width: '100%', marginBottom: 20 }}
        />
      )}
      <ProFormSelect.SearchSelect
        name="actionDevices"
        placeholder={'Select at least one device'}
        fieldProps={{
          menuItemSelectedIcon: <CheckCircleFilled />,
          style: {
            minWidth: 240,
          },
        }}
        rules={[
          { required: true, message: 'Please select at least one device!' },
        ]}
        request={async () => {
          return getDevices().then((response) => {
            return response.data.map((e: API.DeviceItem) => {
              return { label: `${e.fqdn} (${e.ip})`, value: e.uuid };
            });
          });
        }}
      />
    </>
  );
};

export default PlaybookActionSubForm;

import ExtraVarView from '@/components/PlaybookSelection/ExtraVarView';
import { getAllDevices } from '@/services/rest/device';
import { getPlaybooks } from '@/services/rest/playbooks';
import { CheckCircleFilled, FileOutlined, LockFilled } from '@ant-design/icons';
import { ProFormSelect } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { Collapse, Space } from 'antd';
import { FormInstance } from 'antd/lib';
import React, { Dispatch, useEffect } from 'react';
import { API } from 'ssm-shared-lib';

type PlaybookActionSubFormProps = {
  setOverrideExtraVars: Dispatch<React.SetStateAction<any>>;
  formRef: FormInstance<any>;
};

const PlaybookActionSubForm: React.FC<PlaybookActionSubFormProps> = ({
  setOverrideExtraVars,
  formRef,
}) => {
  const newPlaybookValue = ProForm.useWatch('playbook', formRef);
  const [listOfPlaybooks, setListOfPlaybooks] = React.useState<
    API.PlaybookFile[] | undefined
  >();
  const [selectedPlaybookExtraVars, setSelectedPlaybookExtraVars] =
    React.useState<any[]>();

  useEffect(() => {
    if (newPlaybookValue) {
      const selectedPlaybook = listOfPlaybooks?.find(
        (e) => e.uuid === newPlaybookValue.value,
      );
      if (selectedPlaybook) {
        setOverrideExtraVars(
          selectedPlaybook.extraVars?.map((e) => {
            return { overrideVar: e.extraVar };
          }),
        );
        setSelectedPlaybookExtraVars([
          {
            key: 'variables',
            label: 'Variables',
            children:
              (selectedPlaybook.extraVars &&
                selectedPlaybook.extraVars.length > 0 &&
                selectedPlaybook.extraVars?.map((e) => (
                  <ExtraVarView
                    key={e.extraVar}
                    extraVar={e}
                    setOverrideExtraVars={setOverrideExtraVars}
                    smallView
                  />
                ))) ||
              'NONE',
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
                {typeof option.data.label === 'string' &&
                option.data.label?.startsWith('_') ? (
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
          return getAllDevices().then((response) => {
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

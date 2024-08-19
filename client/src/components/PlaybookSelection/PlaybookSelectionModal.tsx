import ExtraVarView from '@/components/PlaybookSelection/ExtraVarView';
import { getPlaybooks } from '@/services/rest/playbooks';
import { RightSquareOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormSelect,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { Collapse, Form, message } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type PlaybookSelectionModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  itemSelected?: API.DeviceItem[];
  callback: (
    playbook: string,
    playbookName: string,
    target: API.DeviceItem[] | undefined,
    extraVars?: API.ExtraVars,
  ) => void;
};

const PlaybookSelectionModal: React.FC<PlaybookSelectionModalProps> = (
  props,
) => {
  const [form] = Form.useForm<{ playbook: { value: string } }>();
  const [listOfPlaybooks, setListOfPlaybooks] = React.useState<
    API.PlaybookFile[] | undefined
  >();
  const [selectedPlaybookExtraVars, setSelectedPlaybookExtraVars] =
    React.useState<any>();
  const [overrideExtraVars, setOverrideExtraVars] = React.useState<any>([]);

  const handleSelectedPlaybook = (newValue: {
    label: string;
    value: string;
  }) => {
    const selectedPlaybook = listOfPlaybooks?.find(
      (e) => e.uuid === newValue?.value,
    );
    if (selectedPlaybook) {
      setOverrideExtraVars(
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
          selectedPlaybook.extraVars.filter((e) => !e.extraVar.startsWith('_'))
            .length > 0 &&
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
                setOverrideExtraVars={setOverrideExtraVars}
                overrideExtraVars={overrideExtraVars}
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
                setOverrideExtraVars={setOverrideExtraVars}
                overrideExtraVars={overrideExtraVars}
              />
            )) || 'NONE',
        },
      ]);
    } else {
      setSelectedPlaybookExtraVars(undefined);
    }
  };

  return (
    <ModalForm
      title="Playbook"
      open={props.isModalOpen}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setSelectedPlaybookExtraVars(undefined);
          setOverrideExtraVars(undefined);
          props.setIsModalOpen(false);
        },
      }}
      grid={true}
      rowProps={{
        gutter: [16, 0],
      }}
      submitTimeout={2000}
      onFinish={async (values: { playbook: { value: string } }) => {
        props.callback(
          values.playbook.value,
          listOfPlaybooks?.find((e) => values.playbook.value === e.uuid)
            ?.name as string,
          overrideExtraVars
            ?.filter((e: { value?: string; overrideVar: string }) => e.value)
            .map((e: { overrideVar: string; value: string }) => {
              return {
                extraVar: e.overrideVar,
                value: e.value,
              };
            }),
        );
        props.setIsModalOpen(false);
        return true;
      }}
    >
      <ProForm.Group style={{ textAlign: 'center' }}>
        <ProFormSelect.SearchSelect
          name="playbook"
          label="Select a playbook to execute"
          placeholder="Please select a playbook"
          fieldProps={{
            labelInValue: true,
            style: {
              minWidth: 240,
            },
            mode: undefined,
          }}
          onChange={handleSelectedPlaybook}
          rules={[{ required: true, message: 'Please select a playbook!' }]}
          debounceTime={300}
          request={async ({ keyWords = '' }) => {
            return (await getPlaybooks()
              .then((e) => {
                setListOfPlaybooks(e.data);
                return e.data
                  ?.filter(({ name, path }: { name: string; path: string }) => {
                    return name.includes(keyWords) || path.includes(keyWords);
                  })
                  .map((f: API.PlaybookFile) => {
                    return {
                      value: f.uuid,
                      label: f.name,
                    };
                  });
              })
              .catch((error) => {
                message.error({
                  content: `Error retrieving playbooks list (${error.message})`,
                  duration: 6,
                });
                return [];
              })) as RequestOptionsType[];
          }}
        />
      </ProForm.Group>
      <ProForm.Group style={{ textAlign: 'center' }}>
        {selectedPlaybookExtraVars && (
          <Collapse
            items={selectedPlaybookExtraVars}
            bordered={false}
            style={{ width: '100%' }}
          />
        )}
      </ProForm.Group>
      <ProForm.Group style={{ textAlign: 'center' }}>
        <ProFormDependency name={['playbook']}>
          {({ playbook }) => {
            return (
              <span style={{ marginTop: 10 }}>
                <RightSquareOutlined /> SSM will apply &quot;
                {playbook ? playbook.label : '?'}
                &quot; on{' '}
                {props.itemSelected?.map((e) => {
                  return '[' + e.ip + '] ';
                }) || '"All"'}
              </span>
            );
          }}
        </ProFormDependency>
      </ProForm.Group>
    </ModalForm>
  );
};

export default PlaybookSelectionModal;

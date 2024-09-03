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
import { Collapse, Form, message, Typography } from 'antd';
import React, { useEffect } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

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
  const [listOfPlaybooks, setListOfPlaybooks] = React.useState<
    API.PlaybookFile[] | undefined
  >();
  const [selectedPlaybookExtraVars, setSelectedPlaybookExtraVars] =
    React.useState<any>();
  const [overrideExtraVars, setOverrideExtraVars] = React.useState<any>([]);
  const [selectedPlaybook, setSelectedPlaybook] = React.useState<
    API.PlaybookFile | undefined
  >();

  useEffect(() => {
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
          children: (selectedPlaybook.extraVars &&
            selectedPlaybook.extraVars.length > 0 &&
            selectedPlaybook.extraVars?.map((e) => (
              <Form.Item
                key={e.extraVar}
                name={['extraVars', e.extraVar]}
                style={{ padding: 0, margin: 0 }}
              >
                <ExtraVarView
                  extraVar={e}
                  setOverrideExtraVars={setOverrideExtraVars}
                  overrideExtraVars={overrideExtraVars}
                />
              </Form.Item>
            ))) || (
            <Typography.Text italic>
              No variables, edit the playbook to add variables
            </Typography.Text>
          ),
        },
      ]);
    } else {
      setSelectedPlaybookExtraVars(undefined);
    }
  }, [selectedPlaybook, overrideExtraVars]);

  const handleSelectedPlaybook = (newValue: {
    label: string;
    value: string;
  }) => {
    setSelectedPlaybook(
      listOfPlaybooks?.find((e) => e.uuid === newValue?.value),
    );
  };

  return (
    <ModalForm
      title="Playbook"
      open={props.isModalOpen}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setSelectedPlaybookExtraVars(undefined);
          setOverrideExtraVars(undefined);
          setSelectedPlaybook(undefined);
          props.setIsModalOpen(false);
        },
      }}
      grid={true}
      rowProps={{
        gutter: [16, 0],
      }}
      submitTimeout={2000}
      onFinish={async (values: {
        playbook: { value: string };
        extraVars: Record<string, any>;
      }) => {
        props.callback(
          values.playbook.value,
          listOfPlaybooks?.find((e) => values.playbook.value === e.uuid)
            ?.name as string,
          props.itemSelected,
          values.extraVars
            ? Object.keys(values.extraVars).map((key) => ({
                extraVar: key,
                value: values.extraVars[key],
              }))
            : undefined,
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
                  ?.filter(
                    ({ playableInBatch }) =>
                      playableInBatch || props.itemSelected?.length === 1,
                  )
                  ?.filter(({ name, path }: { name: string; path: string }) => {
                    return name.includes(keyWords) || path.includes(keyWords);
                  })
                  .map((f: API.PlaybookFile) => ({
                    value: f.uuid,
                    label: f.name,
                  }));
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
            defaultActiveKey={
              selectedPlaybook?.extraVars?.find(
                (e: API.ExtraVar) =>
                  e.type === SsmAnsible.ExtraVarsType.MANUAL && e.required,
              ) !== undefined
                ? ['variables']
                : undefined
            }
          />
        )}
      </ProForm.Group>
      <ProForm.Group style={{ textAlign: 'center' }}>
        <ProFormDependency name={['playbook']}>
          {({ playbook }) => (
            <span style={{ marginTop: 10 }}>
              <RightSquareOutlined /> SSM will apply &quot;
              {playbook ? playbook.label : '?'}&quot; on{' '}
              {props.itemSelected?.map((e) => `[${e.ip}] `) || '"All"'}
            </span>
          )}
        </ProFormDependency>
      </ProForm.Group>
    </ModalForm>
  );
};

export default PlaybookSelectionModal;

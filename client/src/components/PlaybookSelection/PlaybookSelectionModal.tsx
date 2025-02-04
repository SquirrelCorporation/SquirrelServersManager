import {
  Diff,
  InterfaceEditPencilChangeEditModifyPencilWriteWriting,
  TriangleFlag,
} from '@/components/Icons/CustomIcons';
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
import {
  Button,
  Collapse,
  Dropdown,
  Form,
  MenuProps,
  message,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
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
    mode?: SsmAnsible.ExecutionMode,
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
  const [mode, setMode] = React.useState(SsmAnsible.ExecutionMode.APPLY);

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

  const items = [
    {
      key: 'apply',
      label: 'Apply',
      icon: <InterfaceEditPencilChangeEditModifyPencilWriteWriting />,
    },
    { key: 'check', label: 'Check', icon: <TriangleFlag /> },
    {
      key: 'check-diff',
      label: 'Check & Diff',
      icon: (
        <>
          <TriangleFlag /> <Diff />{' '}
        </>
      ),
    },
  ];

  const onMenuClick: MenuProps['onClick'] = (e) => {
    setMode(e.key as SsmAnsible.ExecutionMode);
  };

  return (
    <ModalForm
      title="Playbook"
      open={props.isModalOpen}
      autoFocusFirstInput
      clearOnDestroy
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
          mode,
        );
        props.setIsModalOpen(false);
        return true;
      }}
      submitter={{
        render: ({ submit, reset }) => [
          <Button key="reset" onClick={() => reset()}>
            Reset
          </Button>,
          <Tooltip
            placement={'left'}
            mouseEnterDelay={3}
            title={
              <>
                <Typography.Title level={5} style={{ textAlign: 'center' }}>
                  {' '}
                  Mode
                </Typography.Title>
                <Typography.Paragraph>
                  <Tag>Apply</Tag>is the default, it will effectively execute
                  the change of your device.
                </Typography.Paragraph>
                <Typography.Paragraph>
                  <Tag>Check</Tag>(aka &quot;dry-run&quot;) option runs the
                  playbook in check mode. It goes through all the tasks and
                  shows what would change but{' '}
                  <Typography.Text strong>
                    does not actually perform any changes.
                  </Typography.Text>
                </Typography.Paragraph>
                <Typography.Paragraph>
                  Adding the <Tag>Diff</Tag>option with &quot;check&quot; can
                  show you the differences that would be made to files. This is
                  particularly useful when working with configuration files
                </Typography.Paragraph>
              </>
            }
            key={'execution-mode'}
          >
            <Dropdown.Button
              key={'mode'}
              type={'primary'}
              onClick={submit}
              menu={{ items, onClick: onMenuClick }}
            >
              {items?.find((e) => e?.key === mode)?.label}
            </Dropdown.Button>
          </Tooltip>,
        ],
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
      <ProForm.Group>
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

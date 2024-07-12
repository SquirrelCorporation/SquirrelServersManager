import AutomationActionInnerCard from '@/pages/Automations/components/Drawer/AutomationActionInnerCard';
import AutomationTriggerInnerCard from '@/pages/Automations/components/Drawer/AutomationTriggerInnerCard';
import items from '@/pages/Automations/components/Drawer/templates-data/TemplateList';
import { transformAutomationChain } from '@/pages/Automations/components/Drawer/utils';
import {
  getAutomations,
  getTemplate,
  postAutomation,
  putAutomation,
} from '@/services/rest/automations';
import { ArrowDownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProForm,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Dropdown, Flex, MenuProps, message, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API, Automations } from 'ssm-shared-lib';

type AutomationEditProps = {
  reload: () => void;
  selectedRow?: API.Automation;
  setSelectedRow: React.Dispatch<
    React.SetStateAction<API.Automation | undefined>
  >;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AutomationEditionDrawer: React.FC<AutomationEditProps> = (props) => {
  const [form] = ProForm.useForm<any>();
  const [automations, setAutomations] = useState<API.Automation[]>([]);
  const [overrideExtraVars, setOverrideExtraVars] = React.useState<any>([]);
  const formRefName = useRef<ProFormInstance<{ name: string }> | undefined>(
    null,
  );

  const asyncFetch = async () => {
    const response = await getAutomations();
    setAutomations(response.data);
  };

  useEffect(() => {
    void asyncFetch();
  }, []);

  const onTemplateClick: MenuProps['onClick'] = async ({ key }) => {
    const idx = parseInt(key);
    await getTemplate(idx).then(
      (response: { data: Automations.AutomationChain }) => {
        const automation = response.data;
        form.setFieldsValue(transformAutomationChain(automation));
      },
    );
  };

  return (
    <>
      <DrawerForm
        form={form}
        title="Automation Editor"
        open={props.open}
        request={
          props.selectedRow
            ? async () => {
                return transformAutomationChain(
                  (props.selectedRow as API.Automation).automationChains,
                );
              }
            : undefined
        }
        drawerProps={{
          placement: 'left',
          destroyOnClose: true,
          onClose: () => {
            props.setOpen(false);
            props.setSelectedRow(undefined);
          },
          extra: (
            <Space direction={'vertical'} align={'center'}>
              <ProForm<{ name: string }>
                formRef={formRefName}
                submitter={{ render: () => <></> }}
                grid={false}
                layout={'inline'}
              >
                <ProFormText
                  name={'name'}
                  style={{ marginBottom: 0 }}
                  initialValue={props.selectedRow?.name}
                  rules={[
                    { required: true },
                    {
                      validator(_, value) {
                        if (
                          props.selectedRow?.name === value ||
                          automations?.findIndex((e) => e.name === value) === -1
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject('Name already exists');
                      },
                    },
                  ]}
                  placeholder={'Automation name'}
                />
              </ProForm>
            </Space>
          ),
        }}
        onFinish={async (formData) => {
          const value =
            await formRefName.current?.validateFieldsReturnFormatValue?.();
          if (!value || !value.name) {
            return;
          }
          const rawChain: Automations.AutomationChain = {
            trigger: formData.trigger,
            cronValue: formData.cronValue,
            actions: [],
          };
          if (formData.action === Automations.Actions.PLAYBOOK) {
            const actionChain: Automations.ActionChainPlaybook = {
              action: Automations.Actions.PLAYBOOK,
              playbook: formData.playbook.value,
              actionDevices: formData.actionDevices.map(
                (e: { value: string }) => e.value,
              ),
              extraVarsForcedValues: overrideExtraVars,
            };
            rawChain.actions.push(actionChain);
          } else if (formData.action === Automations.Actions.DOCKER) {
            const actionChain: Automations.ActionChainDocker = {
              action: Automations.Actions.DOCKER,
              dockerAction: formData.dockerAction.value,
              dockerContainers: formData.dockerContainers.map(
                (e: { value: string }) => e.value,
              ),
            };
            rawChain.actions.push(actionChain);
          } else {
            message.error({ content: 'Automation format is not correct' });
            return;
          }
          if (props.selectedRow) {
            return await postAutomation(
              props.selectedRow.uuid,
              value.name,
              rawChain,
            )
              .then(() => {
                props.reload();
                props.setOpen(false);
                return true;
              })
              .catch(() => {
                return false;
              });
          } else {
            return await putAutomation(value.name, rawChain)
              .then(() => {
                props.reload();
                props.setOpen(false);
                return true;
              })
              .catch(() => {
                return false;
              });
          }
        }}
        submitter={{
          render: (_, defaultDoms) => {
            return [
              <Dropdown
                menu={{ items, onClick: onTemplateClick }}
                key={'templates'}
              >
                <Button>
                  <Space>
                    Templates
                    <UpOutlined />
                  </Space>
                </Button>
              </Dropdown>,
              <Button
                key="reset"
                type={'dashed'}
                onClick={() => {
                  form.resetFields();
                }}
              >
                Reset
              </Button>,
              ...defaultDoms,
            ];
          },
        }}
        trigger={
          <Button type="primary">
            <PlusOutlined />
            Create a new automation
          </Button>
        }
        resize={{
          onResize() {
            console.log('resize!');
          },
          maxWidth: window.innerWidth * 0.8,
          minWidth: 500,
        }}
      >
        <ProForm.Group>
          <AutomationTriggerInnerCard formRef={form} />
          <Flex
            align={'center'}
            justify={'center'}
            style={{ width: 440, marginTop: 5, marginBottom: 5 }}
          >
            <ArrowDownOutlined style={{ fontSize: 30, textAlign: 'center' }} />
          </Flex>
          <AutomationActionInnerCard
            setOverrideExtraVars={setOverrideExtraVars}
            overrideExtraVars={overrideExtraVars}
            formRef={form}
          />
        </ProForm.Group>
      </DrawerForm>
    </>
  );
};

export default AutomationEditionDrawer;

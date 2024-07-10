import AutomationActionInnerCard from '@/pages/Automations/components/Drawer/AutomationActionInnerCard';
import AutomationTriggerInnerCard from '@/pages/Automations/components/Drawer/AutomationTriggerInnerCard';
import items from '@/pages/Automations/components/Drawer/templates-data/TemplateList';
import {
  getAutomations,
  getTemplate,
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
import { Automations } from 'ssm-shared-lib';
import { Actions } from 'ssm-shared-lib/distribution/form/automation';
import { Automation } from 'ssm-shared-lib/distribution/types/api';

const AutomationEditionDrawer: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [onUpdate, setOnUpdate] = React.useState<string | undefined>();
  const formRef = useRef<ProFormInstance | undefined>(undefined);
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
        formRef?.current?.setFieldsValue({
          trigger: automation.trigger,
          cronValue: automation.cronValue,
          action: automation.actions[0]?.action,
          playbook: {
            value: (automation.actions[0] as Automations.ActionChainPlaybook)
              ?.playbook,
          },
          actionDevices: (
            automation.actions[0] as Automations.ActionChainPlaybook
          )?.actionDevices?.map((device) => ({
            value: device,
          })),
          dockerAction: {
            value: (automation.actions[0] as Automations.ActionChainDocker)
              ?.dockerAction,
          },
          dockerContainers: (
            automation.actions[0] as Automations.ActionChainDocker
          )?.dockerContainers?.map((container) => ({
            value: container,
          })),
        });
        setOnUpdate(key);
      },
    );
  };

  return (
    <>
      <DrawerForm
        title="Automation Editor"
        formRef={formRef}
        drawerProps={{
          placement: 'left',
          destroyOnClose: true,
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
                  rules={[
                    { required: true },
                    {
                      validator(_, value) {
                        if (
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
              action: Actions.PLAYBOOK,
              playbook: formData.playbook.value,
              actionDevices: formData.actionDevices.map(
                (e: { value: string }) => e.value,
              ),
            };
            rawChain.actions.push(actionChain);
          } else if (formData.action === Automations.Actions.DOCKER) {
            const actionChain: Automations.ActionChainDocker = {
              action: Actions.DOCKER,
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
          await putAutomation(value.name, rawChain);
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
              <Button onClick={() => formRef?.current?.resetFields()}>
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
          <AutomationTriggerInnerCard formRef={formRef} onUpdate={onUpdate} />
          <Flex
            align={'center'}
            justify={'center'}
            style={{ width: 440, marginTop: 5, marginBottom: 5 }}
          >
            <ArrowDownOutlined style={{ fontSize: 30, textAlign: 'center' }} />
          </Flex>
          <AutomationActionInnerCard />
        </ProForm.Group>
      </DrawerForm>
    </>
  );
};

export default AutomationEditionDrawer;

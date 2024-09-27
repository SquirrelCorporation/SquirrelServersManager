import { StackIcon } from '@/components/ComposeEditor/StackIconSelector';
import { Target } from '@/components/Icons/CustomIcons';
import DockerOpsModal from '@/pages/Containers/components/sub-components/DockerOpsModal';
import { postDeployContainerCustomStack } from '@/services/rest/containers';
import { getDevices } from '@/services/rest/device';
import { CheckCircleFilled, RocketOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormSelect,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { Button, Divider, Space, Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type DeployCustomStackModalProps = {
  stackUuid: string;
  name: string;
  stackIcon: { icon: string; iconColor: string; iconBackgroundColor: string };
};

const DeployCustomStackModal: React.FC<DeployCustomStackModalProps> = ({
  stackUuid,
  name,
  stackIcon,
}) => {
  const [form] = ProForm.useForm();
  const [createModuleModalOpened, setCreateModuleModalOpened] =
    React.useState(false);
  const [data, setData] = React.useState<
    API.DeployContainerCustomStacks | undefined
  >();

  return (
    <>
      <DockerOpsModal
        data={data}
        setIsOpen={setCreateModuleModalOpened}
        isOpen={createModuleModalOpened}
        call={async (data) =>
          await postDeployContainerCustomStack(stackUuid, data)
        }
        displayName={'Deploy Custom Stack'}
      />
      <ModalForm
        form={form}
        title={
          <>
            <RocketOutlined /> Deploy Your Custom Stack
          </>
        }
        autoFocusFirstInput
        trigger={
          <Button>
            <RocketOutlined />
            Deploy
          </Button>
        }
        onFinish={async (values) => {
          const { target } = values;
          setData(target);
          setCreateModuleModalOpened(true);
          return true;
        }}
      >
        <Divider dashed plain>
          {' '}
          <StackIcon stackIcon={stackIcon} /> {name}
        </Divider>
        <div
          style={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography.Text> ... will be deploy on:</Typography.Text>
        </div>
        <Divider dashed plain>
          Target
        </Divider>
        <ProFormSelect
          name={'target'}
          style={{ marginTop: 10 }}
          mode={'single'}
          fieldProps={{
            menuItemSelectedIcon: <CheckCircleFilled />,
            labelRender: (_) => (
              <Space>
                <span role="img" aria-label={_.label as string}>
                  <Target />
                </span>
                {_.label}
              </Space>
            ),
          }}
          placeholder={'Please select a target'}
          request={async () => {
            return getDevices().then((e) => {
              return e?.data?.map((device: API.DeviceItem) => ({
                label: `${device.fqdn} (${device.ip})`,
                value: device.uuid,
              })) as RequestOptionsType[];
            });
          }}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </>
  );
};
export default DeployCustomStackModal;

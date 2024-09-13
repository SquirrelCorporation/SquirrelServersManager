import { Deploy, Target } from '@/components/Icons/CustomIcons';
import ProCardEnvironmentConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardEnvironmentConfiguration';
import ProCardExtrasConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardExtrasConfiguration';
import ProCardGeneralConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardGeneralConfiguration';
import ProCardLabelsConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardLabelsConfiguration';
import ProCardPortsConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardPortsConfiguration';
import ProCardVolumesConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardVolumesConfiguration';
import DockerOpsModal from '@/pages/Containers/components/sub-components/DockerOpsModal';
import { getDevices } from '@/services/rest/device';
import { postDeploy } from '@/services/rest/services';
import { CheckCircleFilled } from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Avatar, Divider, Input, Space, Tag } from 'antd';
import React, { useRef } from 'react';
import { API } from 'ssm-shared-lib';

type ContainerStartModalProps = {
  open: boolean;
  setOpen: any;
  template: API.Template;
};

const ContainerStartModal: React.FC<ContainerStartModalProps> = (
  props: ContainerStartModalProps,
) => {
  const [form] = ProForm.useForm<API.Template & API.Targets>();
  const actionRef = useRef();
  const [deployModalOpened, setDeployModalOpened] = React.useState(false);
  const [data, setData] = React.useState<
    (API.Template & API.Targets) | undefined
  >();

  return (
    <>
      <DockerOpsModal
        data={data as API.Template & API.Targets}
        setIsOpen={setDeployModalOpened}
        isOpen={deployModalOpened}
        call={postDeploy}
        displayName={'deploy'}
      />
      <ModalForm<API.Template & API.Targets>
        title={
          <>
            <Deploy /> Deploy
          </>
        }
        form={form}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        submitTimeout={2000}
        onFinish={async (values) => {
          setData({ ...props.template, ...values });
          setDeployModalOpened(true);
          return true;
        }}
        open={props.open}
        onOpenChange={props.setOpen}
      >
        <Divider dashed>
          <Avatar
            size={50}
            shape="square"
            style={{
              marginRight: 4,
              backgroundColor: 'rgba(41,70,147,0.51)',
            }}
            src={props.template?.logo}
          />
          {props.template?.title}
        </Divider>
        <ProDescriptions<API.Template>
          actionRef={actionRef}
          column={2}
          // bordered
          formProps={{
            onValuesChange: (e, f) => console.log(f),
          }}
          request={async () => {
            return Promise.resolve({
              success: true,
              data: props.template,
            });
          }}
          columns={[
            {
              title: 'Categories',
              key: 'categories',
              dataIndex: 'categories',
              editable: false,
              render: (_, row) => (
                <>
                  {row.categories?.map((e: string) => {
                    return <Tag key={e}>{e}</Tag>;
                  })}
                </>
              ),
            },
            {
              title: 'Image',
              key: 'image',
              dataIndex: 'image',
              editable: false,
            },
            {
              title: 'Description',
              key: 'description',
              dataIndex: 'description',
              editable: false,
              span: 2,
              renderFormItem: () => {
                return <Input placeholder="输入 Success 切换分值" />;
              },
            },
          ]}
        />
        <Divider dashed plain>
          Configuration
        </Divider>
        <ProCard style={{ marginBlockStart: 8 }} wrap>
          <ProCardGeneralConfiguration template={props.template} />
          <ProCardPortsConfiguration template={props.template} />
          <ProCardVolumesConfiguration template={props.template} />
          <ProCardEnvironmentConfiguration template={props.template} />
          <ProCardLabelsConfiguration template={props.template} />
          <ProCardExtrasConfiguration template={props.template} />
        </ProCard>
        <Divider dashed plain>
          Targets
        </Divider>
        <ProFormSelect
          name={'targets'}
          style={{ marginTop: 10 }}
          mode={'tags'}
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
              return e.data.map((device: API.DeviceItem) => ({
                label: `${device.fqdn} (${device.ip})`,
                value: device.uuid,
              }));
            });
          }}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </>
  );
};

export default ContainerStartModal;

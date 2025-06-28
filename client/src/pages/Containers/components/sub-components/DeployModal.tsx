import { Deploy } from '@shared/ui/icons/categories/actions';
import { Target } from '@shared/ui/icons/categories/ui';
import ProCardEnvironmentConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardEnvironmentConfiguration';
import ProCardExtrasConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardExtrasConfiguration';
import ProCardGeneralConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardGeneralConfiguration';
import ProCardLabelsConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardLabelsConfiguration';
import ProCardPortsConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardPortsConfiguration';
import ProCardVolumesConfiguration from '@/pages/Containers/components/sub-components/deploy-configuration-forms/ProCardVolumesConfiguration';
import DockerOpsModal from '@/pages/Containers/components/sub-components/DockerOpsModal';
import { getAllDevices } from '@/services/rest/devices/devices';
import { postDeploy } from '@/services/rest/containers/container-templates';
import { CheckCircleFilled } from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Avatar, Divider, Input, Space, Tag } from 'antd';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { API } from 'ssm-shared-lib';

type DeployModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  template: API.Template;
};

const DeployModal: React.FC<DeployModalProps> = ({
  open,
  setOpen,
  template,
}) => {
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
          setData({ ...template, ...values });
          setDeployModalOpened(true);
          return true;
        }}
        open={open}
        onOpenChange={setOpen}
      >
        <Divider dashed>
          <Avatar
            size={50}
            shape="square"
            style={{
              marginRight: 4,
              backgroundColor: 'rgba(41,70,147,0.51)',
            }}
            src={template?.logo}
          />
          {template?.title}
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
              data: template,
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
                return <Input placeholder="Description" />;
              },
            },
          ]}
        />
        <Divider dashed plain>
          Configuration
        </Divider>
        <ProCard style={{ marginBlockStart: 8 }} wrap>
          <ProCardGeneralConfiguration template={template} />
          <ProCardPortsConfiguration template={template} />
          <ProCardVolumesConfiguration template={template} />
          <ProCardEnvironmentConfiguration template={template} />
          <ProCardLabelsConfiguration template={template} />
          <ProCardExtrasConfiguration template={template} />
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
            return getAllDevices().then((e) => {
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

export default DeployModal;

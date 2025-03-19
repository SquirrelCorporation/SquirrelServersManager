import { ContainerVolumeSolid, Target } from '@/components/Icons/CustomIcons';
import DockerOpsModal from '@/pages/Containers/components/sub-components/DockerOpsModal';
import { getAllDevices } from '@/services/rest/devices/devices';
import { postVolume } from '@/services/rest/containers/container-volumes';
import { CheckCircleFilled, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormSelect,
  ProFormText,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { Button, Card, Divider, Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const CreateVolumeModal = () => {
  const [form] = ProForm.useForm();
  const [createModuleModalOpened, setCreateModuleModalOpened] =
    React.useState(false);
  const [data, setData] = React.useState<API.CreateNetwork | undefined>();
  return (
    <>
      <DockerOpsModal
        data={data as API.CreateVolume}
        setIsOpen={setCreateModuleModalOpened}
        isOpen={createModuleModalOpened}
        call={postVolume}
        displayName={'createDockerVolume'}
      />
      <ModalForm
        form={form}
        title={
          <>
            <ContainerVolumeSolid /> Create a Volume
          </>
        }
        autoFocusFirstInput
        trigger={
          <Button type="primary">
            <PlusOutlined />
            Create a volume
          </Button>
        }
        onFinish={async (values) => {
          const { target, ...config } = values;
          setData({ config, target });
          setCreateModuleModalOpened(true);
          return true;
        }}
      >
        <Card type={'inner'}>
          <ProFormText
            label={'Name'}
            name={'name'}
            rules={[{ required: true }]}
          />
        </Card>
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
            return getAllDevices().then((e) => {
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

export default CreateVolumeModal;

import { getPlaybooks } from '@/services/rest/ansible';
import { RightSquareOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormSelect,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import React from 'react';

export type PlaybookSelectionModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  itemSelected: any;
  callback: (playbook: string) => void;
};
const PlaybookSelectionModal: React.FC<PlaybookSelectionModalProps> = (
  props,
) => {
  const [form] = Form.useForm<{ playbook: { value: string } }>();
  return (
    <ModalForm
      title="Playbook"
      open={props.isModalOpen}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.setIsModalOpen(false),
      }}
      grid={true}
      rowProps={{
        gutter: [16, 0],
      }}
      submitTimeout={2000}
      onFinish={async (values: { playbook: { value: string } }) => {
        props.callback(values.playbook.value);
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
          rules={[{ required: true, message: 'Please select a playbook!' }]}
          debounceTime={300}
          request={async ({ keyWords = '' }) => {
            return (await getPlaybooks()
              .then((e) => {
                return e.data?.filter(({ value, label }) => {
                  return value.includes(keyWords) || label.includes(keyWords);
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
        <ProFormDependency name={['playbook']}>
          {({ playbook }) => {
            return (
              <span>
                <RightSquareOutlined /> SSM will apply &quot;
                {playbook ? playbook.value : '?'}
                &quot; on {props.itemSelected?.ip}
              </span>
            );
          }}
        </ProFormDependency>
      </ProForm.Group>
    </ModalForm>
  );
};

export default PlaybookSelectionModal;

import { getPlaybooks } from '@/services/ant-design-pro/ansible';
import { RightSquareOutlined } from '@ant-design/icons';
import { ModalForm, ProForm, ProFormDependency, ProFormSelect } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import React from 'react';

export type PlaybookSelectionModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  itemSelected: any;
};
const PlaybookSelectionModal: React.FC<PlaybookSelectionModalProps> = (props) => {
  const [form] = Form.useForm<{ playbook: string }>();
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
      onFinish={async (values) => {
        //await waitTime(2000);
        message.success('提交成功');
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
            return await getPlaybooks()
              .then((e) => {
                return e.data?.filter(({ value, label }) => {
                  return value.includes(keyWords) || label.includes(keyWords);
                });
              })
              .catch((error) => {
                return [];
              });
          }}
        />
      </ProForm.Group>
      <ProForm.Group style={{ textAlign: 'center' }}>
        <ProFormDependency name={['playbook']}>
          {({ playbook }) => {
            return (
              <span>
                <RightSquareOutlined /> SSM will apply &quot;{playbook ? playbook.value : '?'}
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

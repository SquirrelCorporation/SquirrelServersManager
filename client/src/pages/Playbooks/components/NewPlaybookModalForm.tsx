import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Button } from 'antd';
import { AddCircleOutline } from 'antd-mobile-icons';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type NewPlaybookModalFormProps = {
  submitNewPlaybook: (name: string) => Promise<boolean>;
  playbookFilesList: API.PlaybookFileList[];
};

const NewPlaybookModalForm: React.FC<NewPlaybookModalFormProps> = (props) => {
  return (
    <ModalForm<{ name: string }>
      title={'Create a new playbook'}
      trigger={
        <Button
          icon={<AddCircleOutline />}
          type="primary"
          style={{ marginTop: '8px' }}
          block
        >
          New Playbook
        </Button>
      }
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        return await props.submitNewPlaybook(values.name);
      }}
    >
      <ProFormText
        width={'xl'}
        required={true}
        name={'name'}
        label={'Playbook name'}
        tooltip={"Enter a playbook name, character '_' is not authorized"}
        placeholder="playbook name"
        rules={[
          {
            required: true,
            message: 'Please input your playbook name!',
          },
          {
            pattern: new RegExp('^[0-9a-zA-Z\\-]{0,100}$'),
            message:
              'Please enter a valid file name (only alphanumerical and "-" authorized), max 100 chars',
          },
          {
            validator(_, value) {
              if (
                props.playbookFilesList.findIndex((e) => e.label === value) ===
                -1
              ) {
                return Promise.resolve();
              }
              return Promise.reject('Playbook name already exists');
            },
          },
        ]}
      />
    </ModalForm>
  );
};

export default NewPlaybookModalForm;

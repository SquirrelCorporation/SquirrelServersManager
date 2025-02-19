import { ModalForm, ProFormText } from '@ant-design/pro-components';
import React from 'react';

export type CreateFileInRepositoryModalFormProps = {
  submitNewFile: (
    playbooksRepositoryUuid: string,
    fileName: string,
    fullPath: string,
    mode: 'playbook' | 'directory',
  ) => Promise<boolean>;
  path: string;
  playbooksRepositoryUuid: string;
  playbooksRepositoryName: string;
  mode: 'playbook' | 'directory';
  opened: boolean;
  setModalOpened: any;
  basedPath: string;
};

const CreateFileInRepositoryModalForm: React.FC<
  CreateFileInRepositoryModalFormProps
> = (props) => {
  console.log(`path: ${props.path}, basedPath: ${props.basedPath}`);
  return (
    <ModalForm<{ name: string }>
      title={`Create a new ${props.mode}`}
      open={props.opened}
      autoFocusFirstInput
      clearOnDestroy
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.setModalOpened(false),
      }}
      onFinish={async (values) => {
        return await props
          .submitNewFile(
            props.playbooksRepositoryUuid,
            values.name,
            `${props.path}/${values.name}`,
            props.mode,
          )
          .then(() => {
            props.setModalOpened(false);
          });
      }}
    >
      <ProFormText
        width={'xl'}
        required={true}
        name={'name'}
        fieldProps={{
          prefix:
            props.path.replace(props.basedPath, props.playbooksRepositoryName) +
            '/',
          suffix: props.mode === 'playbook' ? '.yml' : undefined,
        }}
        label={`${props.mode} name`}
        tooltip={`Enter a ${props.mode} name (the character '_' is not authorized)`}
        placeholder={`${props.mode} name`}
        rules={[
          {
            required: true,
            message: `Please input your ${props.mode} name!`,
          },
          {
            pattern: new RegExp('^[0-9a-zA-Z\\-]{0,100}$'),
            message:
              'Please enter a valid name (only alphanumerical and "-" authorized), max 100 chars',
          },
        ]}
      />
    </ModalForm>
  );
};

export default CreateFileInRepositoryModalForm;

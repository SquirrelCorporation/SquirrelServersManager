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
> = ({
  setModalOpened,
  opened,
  mode,
  path,
  basedPath,
  playbooksRepositoryName,
  playbooksRepositoryUuid,
  submitNewFile,
}) => {
  console.log(`path: ${path}, basedPath: ${basedPath}`);
  return (
    <ModalForm<{ name: string }>
      title={`Create a new ${mode}`}
      open={opened}
      autoFocusFirstInput
      clearOnDestroy
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setModalOpened(false),
      }}
      onFinish={async (values) => {
        return await submitNewFile(
          playbooksRepositoryUuid,
          values.name,
          `${path}/${values.name}`,
          mode,
        ).then(() => {
          setModalOpened(false);
        });
      }}
    >
      <ProFormText
        width={'xl'}
        required={true}
        name={'name'}
        fieldProps={{
          prefix: path.replace(basedPath, playbooksRepositoryName) + '/',
          suffix: mode === 'playbook' ? '.yml' : undefined,
        }}
        label={`${mode} name`}
        tooltip={`Enter a ${mode} name (the character '_' is not authorized)`}
        placeholder={`${mode} name`}
        rules={[
          {
            required: true,
            message: `Please input your ${mode} name!`,
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

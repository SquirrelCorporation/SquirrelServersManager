import { getPlaybooksRepositories } from '@/services/rest/playbooks-repositories';
import {
  DrawerForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormRadio,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import { AddCircleOutline } from 'antd-mobile-icons';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type NewFileModalFormProps = {
  submitNewFile: (
    playbooksRepositoryUuid: string,
    fileName: string,
    fullPath: string,
    mode: 'playbook' | 'directory',
  ) => Promise<boolean>;
  setSelectedNode: any;
};

const NewFileDrawerForm: React.FC<NewFileModalFormProps> = (props) => {
  const [repositories, setRepositories] = React.useState<
    API.PlaybooksRepository[] | undefined
  >();
  const [loading, setLoading] = React.useState(false);
  return (
    <DrawerForm<{ name: string; repository: string; type: string }>
      title={`Create a new file`}
      autoFocusFirstInput
      loading={loading}
      resize={{
        onResize() {
          console.log('resize!');
        },
        maxWidth: window.innerWidth * 0.8,
        minWidth: 300,
      }}
      trigger={
        <Button
          icon={<AddCircleOutline />}
          type="primary"
          style={{ marginTop: '8px' }}
          block
        >
          Create
        </Button>
      }
      drawerProps={{
        destroyOnClose: true,
        onClose: () => props.setSelectedNode([]),
      }}
      onFinish={async (values) => {
        setLoading(true);
        await props
          .submitNewFile(
            values.repository,
            values.name,
            `${
              repositories?.find((e) => e.uuid === values.repository)?.path
            }/${values.name}`,
            values.type as 'playbook' | 'directory',
          )
          .finally(() => {
            setLoading(false);
          });
        return true;
      }}
    >
      <ProFormSelect
        placeholder={'For repository'}
        name={'repository'}
        onChange={(e) => {
          props.setSelectedNode(repositories?.find((f) => f.uuid === e)?.name);
        }}
        request={async () => {
          return await getPlaybooksRepositories().then((e) => {
            setRepositories(e?.data);
            return e.data
              ? e.data.map((f) => {
                  return {
                    label: f.name,
                    value: f.uuid,
                    path: f.path,
                  };
                })
              : [];
          });
        }}
      />
      <ProFormDependency name={['repository']}>
        {({ repository }) => {
          if (repository) {
            return (
              <>
                <ProFormRadio.Group
                  label="Type"
                  radioType="button"
                  name={'type'}
                  colProps={{
                    span: 20,
                  }}
                  options={['directory', 'playbook']}
                  required={true}
                  rules={[
                    {
                      required: true,
                      message: `Please select a type!`,
                    },
                  ]}
                />
                <ProFormDependency name={['type']}>
                  {({ type }) => {
                    if (type) {
                      return (
                        <ProFormText
                          width={'xl'}
                          required={true}
                          name={'name'}
                          label={`File or directory name`}
                          tooltip={`Enter a name (the character '_' is not authorized)`}
                          placeholder={`name`}
                          fieldProps={{
                            prefix: `${
                              repositories?.find((e) => e.uuid === repository)
                                ?.name
                            }/`,
                            suffix: type === 'playbook' ? '.yml' : undefined,
                          }}
                          rules={[
                            {
                              required: true,
                              message: `Please input a name!`,
                            },
                            {
                              pattern: new RegExp('^[0-9a-zA-Z\\-]{0,100}$'),
                              message:
                                'Please enter a valid name (only alphanumerical and "-" authorized), max 100 chars',
                            },
                          ]}
                        />
                      );
                    }
                  }}
                </ProFormDependency>
              </>
            );
          }
        }}
      </ProFormDependency>
    </DrawerForm>
  );
};

export default NewFileDrawerForm;

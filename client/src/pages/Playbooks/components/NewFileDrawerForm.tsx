import { buildTree } from '@/pages/Playbooks/components/TreeComponent';
import { getPlaybooksRepositories } from '@/services/rest/playbooks/repositories';
import { FileAddOutlined, FolderAddOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormDependency,
  ProFormItem,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Button, Select, TreeSelectProps, Typography } from 'antd';
import { AddCircleOutline } from 'antd-mobile-icons';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

export type NewFileModalFormProps = {
  submitNewFile: (
    playbooksRepositoryUuid: string,
    fileName: string,
    fullPath: string,
    mode: 'playbook' | 'directory',
  ) => Promise<boolean>;
};
const { Option } = Select;

const NewFileDrawerForm: React.FC<NewFileModalFormProps> = ({
  submitNewFile,
}) => {
  const [repositories, setRepositories] = React.useState<
    API.PlaybooksRepository[] | undefined
  >();
  const [loading, setLoading] = React.useState(false);
  const [fileType, setFileType] = React.useState('directory');
  const [selectedPlaybook, setSelectedPlaybook] = React.useState<
    API.PlaybooksRepository | undefined
  >();

  useEffect(() => {
    setLoading(true);
    void getPlaybooksRepositories()
      .then((res) => {
        setRepositories(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const onSelect: TreeSelectProps['onSelect'] = (value, info) => {
    setSelectedPlaybook(
      repositories?.find((e) => info?.playbookRepository?.uuid === e.uuid),
    );
  };

  const selectBefore = (
    <Select
      defaultValue="directory"
      onSelect={(value: string) => setFileType(value)}
    >
      <Option value="directory">Directory</Option>
      <Option value="playbook">Playbook</Option>
    </Select>
  );
  return (
    <DrawerForm<{ name: string; repository: string; type: string }>
      title={`Create a new file`}
      autoFocusFirstInput
      loading={loading}
      resize={{
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
      }}
      onFinish={async (values) => {
        setLoading(true);
        await submitNewFile(
          selectedPlaybook?.uuid as string,
          values.name,
          `${values.repository}/${values.name}`,
          fileType as 'playbook' | 'directory',
        ).finally(async () => {
          await getPlaybooksRepositories().then((res) => {
            setRepositories(res.data);
          });
          setLoading(false);
        });
        return true;
      }}
    >
      <ProFormTreeSelect
        label={`Repository path`}
        style={{ width: '100%' }}
        name={'repository'}
        rules={[
          {
            required: true,
            message: `Please choose a path!`,
          },
        ]}
        fieldProps={{
          onSelect: onSelect,
          onDeselect: () => {
            setSelectedPlaybook(undefined);
          },
          showSearch: true,
          dropdownStyle: { maxHeight: 400, overflow: 'auto' },
          fieldNames: {
            label: '_name',
            value: 'key',
          },
          treeDefaultExpandAll: true,
          treeData: repositories?.map((e) => {
            return {
              ...buildTree(e as API.PlaybooksRepository, true),
              key: e.path,
            };
          }),
        }}
        placeholder="Please select"
        allowClear
      />
      <ProFormDependency name={['repository']}>
        {({ repository }) => {
          if (repository) {
            return (
              <>
                {' '}
                <ProFormText
                  width={'xl'}
                  required={true}
                  name={'name'}
                  label={`File or directory name`}
                  tooltip={`Enter a name (the character '_' is not authorized)`}
                  placeholder={`name`}
                  fieldProps={{
                    addonBefore: selectBefore,
                    suffix: fileType === 'playbook' ? '.yml' : undefined,
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
              </>
            );
          }
        }}
      </ProFormDependency>
      <ProFormDependency name={['name', 'repository']}>
        {({ name, repository }) => {
          if (repository) {
            return (
              <ProFormItem>
                {fileType === 'playbook' ? (
                  <FileAddOutlined />
                ) : (
                  <FolderAddOutlined />
                )}
                <Typography.Text code>
                  {repository?.replace(
                    selectedPlaybook?.path,
                    selectedPlaybook?.name,
                  )}
                  /{`${name}${fileType === 'playbook' ? '.yml' : ''}`}
                </Typography.Text>
              </ProFormItem>
            );
          }
        }}
      </ProFormDependency>
    </DrawerForm>
  );
};

export default NewFileDrawerForm;

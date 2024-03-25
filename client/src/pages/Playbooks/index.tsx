import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import {
  deletePlaybook,
  getPlaybooks,
  newPlaybook,
  patchPlaybook,
  readPlaybookContent,
} from '@/services/rest/ansible';
import {
  FileOutlined,
  FileSearchOutlined,
  PlaySquareOutlined,
  RedoOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormText,
} from '@ant-design/pro-components';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  Button,
  Card,
  Col,
  FloatButton,
  message,
  Popconfirm,
  Result,
  Row,
  Spin,
  Tree,
  Typography,
} from 'antd';
import type { DirectoryTreeProps } from 'antd/es/tree';
import { configureMonacoYaml } from 'monaco-yaml';
import React, { useEffect } from 'react';
import { editor, languages } from 'monaco-editor';
import { AddCircleOutline, DeleteOutline } from 'antd-mobile-icons';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import { PlaybookFileList } from 'ssm-shared-lib/distribution/types/api';
import ExtraVarsViewEditor from '@/pages/Playbooks/ExtraVarsViewEditor';

window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
        );
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

const { DirectoryTree } = Tree;

const { Paragraph, Text } = Typography;

const Index: React.FC = () => {
  const [playbookFilesList, setPlaybookFilesList] = React.useState<
    PlaybookFileList[]
  >([]);
  const [selectedFile, setSelectedFile] = React.useState<
    PlaybookFileList | undefined
  >();
  const [downloadedContent, setDownloadedContent] = React.useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = React.useState(false);
  const editorRef = React.useRef(null);

  const asyncFetchPlaybookContent = async () => {
    if (selectedFile) {
      await readPlaybookContent(selectedFile.value).then((content) => {
        setDownloadedContent(content.data);
      });
    }
    setIsLoading(false);
  };
  const asyncFetch = async (createdPlaybook?: string) => {
    await getPlaybooks().then((list) => {
      if (list?.data) {
        setPlaybookFilesList(list.data);
        if (createdPlaybook) {
          setSelectedFile(list.data.find((e) => e.label === createdPlaybook));
        }
      } else {
        message.error({
          content: 'Playbooks list is empty, please check your configuration',
          duration: 6,
        });
      }
    });
  };
  useEffect(() => {
    asyncFetch();
  }, []);
  useEffect(() => {
    asyncFetchPlaybookContent();
  }, [selectedFile]);

  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    if (keys[0] !== selectedFile?.label) {
      setIsLoading(true);
      setSelectedFile(
        playbookFilesList.find((e) => e.value === (keys[0] as string)),
      );
    }
    console.log('Trigger Select', keys, info);
  };

  const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };
  const keywords = ['ansible', 'test', 'ggg'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-shadow
  const editorDidMount = (editor: IStandaloneCodeEditor, monaco: Monaco) => {
    // @ts-ignore
    editorRef.current = editor;
    editor.focus();
    configureMonacoYaml(monaco, {
      enableSchemaRequest: true,
      schemas: [
        {
          // If YAML file is opened matching this glob
          fileMatch: ['*.yml'],
          // Then this schema will be downloaded from the internet and used.
          uri: 'https://raw.githubusercontent.com/ansible/ansible-lint/main/src/ansiblelint/schemas/ansible.json#/$defs/playbook',
        },
      ],
    });
  };

  const onClickDeletePlaybook = async () => {
    if (selectedFile) {
      setIsLoading(true);
      await deletePlaybook(selectedFile.value)
        .then(async () => {
          message.warning(`Playbook '${selectedFile.value}' deleted`);
          setSelectedFile(undefined);
          await asyncFetch();
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      message.error(`Internal Error`);
    }
  };

  const onClickSavePlaybook = async () => {
    // @ts-ignore
    if (selectedFile && editorRef.current?.getValue()) {
      setIsLoading(true);
      // @ts-ignore
      await patchPlaybook(selectedFile.value, editorRef.current.getValue())
        .then(() => {
          message.success(`Playbook '${selectedFile.value}' saved`);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      message.error(`Internal - onClickSavePlaybook`);
    }
  };

  const onClickUndoPlaybook = async () => {
    if (editorRef?.current) {
      // @ts-ignore
      editorRef?.current.setValue(downloadedContent);
    } else {
      message.error(`Internal - Error editorRef`);
    }
  };

  const submitNewPlaybook = async (name: string) => {
    setIsLoading(true);
    return await newPlaybook(name)
      .then(async () => {
        message.success(`Playbook '${name}' successfully created`);
        await asyncFetch(name);
        setIsLoading(false);
        return true;
      })
      .catch(async () => {
        await asyncFetch();
        setIsLoading(false);
        return false;
      });
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Playbooks'}
            backgroundColor={PageContainerTitleColors.PLAYBOOKS}
            icon={<PlaySquareOutlined />}
          />
        ),
      }}
    >
      <Spin spinning={isLoading} fullscreen />
      <Row wrap={false} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={6}>
          <Card
            title="List of playbooks"
            bordered={false}
            style={{ width: '300px', minHeight: '90vh' }}
          >
            <DirectoryTree
              multiple
              defaultExpandAll
              onSelect={onSelect}
              onExpand={onExpand}
              treeData={playbookFilesList?.map((e) => {
                return {
                  title: e.label,
                  key: e.value,
                  icon: ({ selected }) =>
                    selected ? <FileSearchOutlined /> : <FileOutlined />,
                };
              })}
              selectedKeys={[selectedFile?.value as React.Key]}
            />
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
                return await submitNewPlaybook(values.name);
              }}
            >
              <ProFormText
                width={'xl'}
                required={true}
                name={'name'}
                label={'Playbook name'}
                tooltip={
                  "Enter a playbook name, character '_' is not authorized"
                }
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
                        playbookFilesList.findIndex(
                          (e) => e.label === value,
                        ) === -1
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject('Playbook name already exists');
                    },
                  },
                ]}
              />
            </ModalForm>
          </Card>
        </Col>
        <Col span={18}>
          {(selectedFile && (
            <>
              <FloatButton.Group shape="square" style={{ right: 94 }}>
                <FloatButton
                  onClick={onClickSavePlaybook}
                  tooltip={'Save file'}
                  icon={<SaveOutlined style={{ color: 'blueviolet' }} />}
                />
                <FloatButton.BackTop
                  tooltip={'Scroll to top'}
                  visibilityHeight={0}
                />
                <FloatButton
                  tooltip={'Reset changes'}
                  icon={<RedoOutlined />}
                  onClick={onClickUndoPlaybook}
                />
                {!selectedFile?.value.startsWith('_') && (
                  <Popconfirm
                    title="Delete the playbook"
                    description="Are you sure to delete this playbook?"
                    onConfirm={onClickDeletePlaybook}
                    okText="Yes"
                    cancelText="No"
                  >
                    <FloatButton
                      tooltip={'Delete file'}
                      icon={<DeleteOutline style={{ color: 'red' }} />}
                    />
                  </Popconfirm>
                )}
              </FloatButton.Group>
              <ExtraVarsViewEditor playbook={selectedFile} />
              <Editor
                theme="vs-dark"
                height="90vh"
                //defaultLanguage="yaml"
                language="yaml"
                path={selectedFile?.value || 'playbook.yml'}
                value={downloadedContent}
                onMount={editorDidMount}
              />
            </>
          )) || (
            <Result title="Select a playbook to edit">
              <div className="desc">
                <Paragraph style={{ textAlign: 'center' }}>
                  <Text strong>
                    To edit a playbook, select a playbook in the left menu
                    &apos;List of Playbooks&apos;
                  </Text>
                </Paragraph>
              </div>
            </Result>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Index;

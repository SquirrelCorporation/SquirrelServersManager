import {
  deletePlaybook,
  getPlaybooks,
  newPlaybook,
  patchPlaybook,
  readPlaybookContent,
} from '@/services/rest/ansible';
import { FileOutlined, FileSearchOutlined, RedoOutlined, SaveOutlined } from '@ant-design/icons';
import { ModalForm, PageContainer, ProFormText } from '@ant-design/pro-components';
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
import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';
import React, { useEffect } from 'react';
import { editor } from 'monaco-editor';
import { AddCircleOutline, DeleteOutline } from 'antd-mobile-icons';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

const { DirectoryTree } = Tree;
const { Paragraph, Text } = Typography;
const Index: React.FC = () => {
  const [playbookFilesList, setPlaybookFilesList] = React.useState<DataNode[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<string | undefined>();
  const [downloadedContent, setDownloadedContent] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const editorRef = React.useRef(null);

  const asyncFetchPlaybookContent = async () => {
    if (selectedFile) {
      await readPlaybookContent(selectedFile)
        .then((content) => {
          setDownloadedContent(content.data);
        })
        .catch((error) => {
          message.error(error);
        });
    }
    setIsLoading(false);
  };
  const asyncFetch = async () => {
    await getPlaybooks()
      .then((list) => {
        if (list?.data) {
          setPlaybookFilesList(
            list.data.map((e) => {
              return {
                title: e.label,
                key: e.value,
                icon: ({ selected }) => (selected ? <FileSearchOutlined /> : <FileOutlined />),
              };
            }),
          );
        } else {
          message.error({
            content: 'Playbooks list is empty, please check your configuration',
            duration: 6,
          });
        }
      })
      .catch((error) => {
        message.error(error);
      });
  };
  useEffect(() => {
    asyncFetch();
  }, []);
  useEffect(() => {
    asyncFetchPlaybookContent();
  }, [selectedFile]);

  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    if (keys[0] !== selectedFile) {
      setIsLoading(true);
      setSelectedFile(keys[0]);
    }
    console.log('Trigger Select', keys, info);
  };

  const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const editorDidMount = (editor: IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onClickDeletePlaybook = async () => {
    console.log('onClickDeletePlaybook', selectedFile);
    if (selectedFile) {
      setIsLoading(true);
      await deletePlaybook(selectedFile)
        .then(async () => {
          message.warning(`Playbook '${selectedFile}' deleted`);
          setSelectedFile(undefined);
          await asyncFetch();
          setIsLoading(false);
        })
        .catch((error) => {
          message.error(`Playbook '${selectedFile}' deletion error (${error.message})`);
          setIsLoading(false);
        });
    } else {
      message.error(`Internal Error`);
      console.log('onClickDeletePlaybook - selectedFile is empty');
    }
  };

  const onClickSavePlaybook = async () => {
    console.log('onClickSavePlaybook', selectedFile);
    setIsLoading(true);
    await patchPlaybook(selectedFile, editorRef.current.getValue())
      .then(() => {
        message.success(`Playbook '${selectedFile}' saved`);
        setIsLoading(false);
      })
      .catch((error) => {
        message.error(`Playbook '${selectedFile}' saving error (${error.message})`);
        setIsLoading(false);
      });
  };

  const onClickUndoPlaybook = async () => {
    console.log('onClickUndoPlaybook', selectedFile);
    editorRef?.current.setValue(downloadedContent);
  };

  const submitNewPlaybook = async (name: string) => {
    setIsLoading(true);
    return await newPlaybook(name)
      .then(async () => {
        message.success(`Playbook '${name}' successfully created`);
        await asyncFetch();
        setSelectedFile(name + '.yml');
        setIsLoading(false);
        return true;
      })
      .catch(async (error) => {
        message.error(`Playbook '${name}' not created ${error.message}`);
        await asyncFetch();
        setIsLoading(false);
        return false;
      });
  };

  return (
    <PageContainer>
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
              treeData={playbookFilesList}
              selectedKeys={[selectedFile]}
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
                tooltip={"Enter a playbook name, character '_' is not authorized"}
                placeholder="playbook name"
                rules={[
                  { required: true, message: 'Please input your playbook name!' },
                  {
                    pattern: /^[0-9a-z\\-]{0-100}$/,
                    message:
                      'Please enter a valid file name (only alphanumerical and "-" authorized), max 100 chars',
                  },
                  {
                    validator(_, value) {
                      if (playbookFilesList.findIndex((e) => e.title === value) === -1) {
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
          {(!selectedFile && (
            <Result title="Select a playbook to edit">
              <div className="desc">
                <Paragraph>
                  <Text strong>
                    To edit a playbook, select a playbook in the left menu &apos;List of
                    Playbooks&apos;
                  </Text>
                </Paragraph>
              </div>
            </Result>
          )) || (
            <>
              <FloatButton.Group shape="square" style={{ right: 94 }}>
                <FloatButton
                  onClick={onClickSavePlaybook}
                  tooltip={'Save file'}
                  icon={<SaveOutlined style={{ color: 'blueviolet' }} />}
                />
                <FloatButton.BackTop tooltip={'Scroll to top'} visibilityHeight={0} />
                <FloatButton
                  tooltip={'Reset changes'}
                  icon={<RedoOutlined />}
                  onClick={onClickUndoPlaybook}
                />
                {!selectedFile?.startsWith('_') && (
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
              <Editor
                theme="vs-dark"
                height="90vh"
                defaultLanguage="yaml"
                path={selectedFile}
                value={downloadedContent}
                onMount={editorDidMount}
              />
            </>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Index;

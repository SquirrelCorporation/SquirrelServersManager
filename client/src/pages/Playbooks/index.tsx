import Title, { TitleColors } from '@shared/ui/templates/PageTitle';
import DirectoryTreeView from '@/pages/Playbooks/components/DirectoryTreeView';
import ExtraVarsViewEditor from '@/pages/Playbooks/components/ExtraVarsViewEditor';
import FloatingButtonsBar from '@/pages/Playbooks/components/FloatingButtonsBar';
import {
  buildTree,
  ClientPlaybooksTrees,
} from '@/pages/Playbooks/components/TreeComponent';
import {
  deletePlaybook,
  patchPlaybook,
  readPlaybookContent,
} from '@/services/rest/playbooks/playbooks';
import {
  createDirectoryInRepository,
  createEmptyPlaybookInRepository,
  deleteAnyInRepository,
  getPlaybooksRepositories,
} from '@/services/rest/playbooks/repositories';
import { PlaySquareOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import Editor, { Monaco } from '@monaco-editor/react';
import message from '@shared/ui/feedback/DynamicMessage';
import { Col, Result, Row, Spin, Typography } from 'antd';
import type { DirectoryTreeProps } from 'antd/es/tree';
import { editor } from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

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

const { Paragraph, Text } = Typography;

const Index: React.FC = () => {
  const [playbookRepositories, setPlaybookRepositories] = React.useState<
    ClientPlaybooksTrees[]
  >([]);
  const [selectedFile, setSelectedFile] = React.useState<
    API.PlaybookFile | undefined
  >();
  const [downloadedContent, setDownloadedContent] = React.useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = React.useState(false);
  const editorRef = React.useRef(null);
  const [newRepositoryFileModal, setNewRepositoryFileModal] = React.useState({
    opened: false,
    playbookRepositoryUuid: '',
    playbookRepositoryName: '',
    playbookRepositoryBasePath: '',
    path: '',
    mode: '',
  });

  const asyncFetchPlaybookContent = async () => {
    if (selectedFile) {
      if (selectedFile.uuid) {
        await readPlaybookContent(selectedFile.uuid)
          .then((content) => {
            setDownloadedContent(content.data);
          })
          .catch(() => {
            setIsLoading(false);
          });
      } else {
        message.error({
          content:
            'Selected file has no uuid - try to synchronize again the repo',
          duration: 6,
        });
      }
    }
    setIsLoading(false);
  };

  const handleShouldCreatePlaybook = (
    path: string,
    playbookRepositoryUuid: string,
    playbookRepositoryName: string,
    playbookRepositoryBasePath: string,
  ) => {
    setNewRepositoryFileModal({
      opened: true,
      mode: 'playbook',
      path: path,
      playbookRepositoryUuid: playbookRepositoryUuid,
      playbookRepositoryName: playbookRepositoryName,
      playbookRepositoryBasePath: playbookRepositoryBasePath,
    });
  };

  const handleShouldCreateRepository = (
    path: string,
    playbookRepositoryUuid: string,
    playbookRepositoryName: string,
    playbookRepositoryBasePath: string,
  ) => {
    setNewRepositoryFileModal({
      opened: true,
      mode: 'directory',
      path: path,
      playbookRepositoryUuid: playbookRepositoryUuid,
      playbookRepositoryName: playbookRepositoryName,
      playbookRepositoryBasePath: playbookRepositoryBasePath,
    });
  };

  const handleShouldDeleteFile = async (
    playbooksRepositoryUuid: string,
    path: string,
  ) => {
    setIsLoading(true);
    await deleteAnyInRepository(playbooksRepositoryUuid, path)
      .then(async () => {
        message.warning({ content: 'File deleted', duration: 6 });
        if (selectedFile?.path === path) {
          setSelectedFile(undefined);
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await asyncFetch();
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const asyncFetch = async (createdPlaybook?: API.PlaybookFile) => {
    await getPlaybooksRepositories().then((list) => {
      if (list?.data) {
        setPlaybookRepositories(
          list.data.map((e: API.PlaybooksRepository) => {
            return buildTree(e);
          }),
        );
        if (createdPlaybook) {
          setSelectedFile(createdPlaybook);
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
    void asyncFetch();
  }, []);

  useEffect(() => {
    void asyncFetchPlaybookContent();
  }, [selectedFile]);

  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    if (keys[0] !== selectedFile?.path) {
      setIsLoading(true);
      const playbook = info.node as unknown as ClientPlaybooksTrees;
      setSelectedFile({
        name: playbook._name,
        extraVars: playbook.extraVars || [],
        uuid: playbook.uuid || '',
        path: playbook.key,
        custom: playbook.custom,
      });
    }
  };

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
      await deletePlaybook(selectedFile.uuid)
        .then(async () => {
          message.warning({
            content: `Playbook '${selectedFile.name}' deleted`,
            duration: 6,
          });
          setSelectedFile(undefined);
          await asyncFetch();
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      message.error({ content: 'Internal Error', duration: 6 });
    }
  };

  const onClickSavePlaybook = async () => {
    // @ts-ignore
    if (selectedFile && editorRef.current?.getValue()) {
      setIsLoading(true);
      // @ts-ignore
      await patchPlaybook(selectedFile.uuid, editorRef.current.getValue())
        .then(() => {
          message.success({
            content: `Playbook '${selectedFile.name}' saved`,
            duration: 6,
          });
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      message.error({ content: 'Internal - onClickSavePlaybook', duration: 6 });
    }
  };

  const onClickUndoPlaybook = async () => {
    if (editorRef?.current) {
      // @ts-ignore
      editorRef?.current.setValue(downloadedContent);
    } else {
      message.error({ content: 'Internal - Error editorRef', duration: 6 });
    }
  };

  const createNewFile = async (
    playbooksRepositoryUuid: string,
    fileName: string,
    fullPath: string,
    mode: 'directory' | 'playbook',
  ): Promise<boolean> => {
    setIsLoading(true);
    if (mode === 'playbook') {
      return await createEmptyPlaybookInRepository(
        playbooksRepositoryUuid,
        fileName,
        fullPath,
      )
        .then(async (e) => {
          message.success({
            content: `Playbook '${fileName}' successfully created`,
            duration: 6,
          });
          await asyncFetch(e.data);
          setIsLoading(false);
          return true;
        })
        .catch(async () => {
          await asyncFetch();
          setIsLoading(false);
          return false;
        });
    }
    if (mode === 'directory') {
      return await createDirectoryInRepository(
        playbooksRepositoryUuid,
        fileName,
        fullPath,
      )
        .then(async () => {
          message.success({
            content: `Directory '${fileName}' successfully created`,
            duration: 6,
          });
          await asyncFetch();
          setIsLoading(false);
          return true;
        })
        .catch(async () => {
          await asyncFetch();
          setIsLoading(false);
          return false;
        });
    }
    throw new Error('Mode is unknown');
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Playbooks'}
            backgroundColor={TitleColors.PLAYBOOKS}
            icon={<PlaySquareOutlined />}
          />
        ),
      }}
    >
      <Spin spinning={isLoading} fullscreen />
      <Row wrap gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 16]}>
        <Col xs={24} md={6}>
          <DirectoryTreeView
            onSelect={onSelect}
            playbookRepositories={playbookRepositories}
            newRepositoryFileModal={newRepositoryFileModal}
            setNewRepositoryFileModal={setNewRepositoryFileModal}
            createNewFile={createNewFile}
            selectedFile={selectedFile}
            callbacks={{
              callbackCreatePlaybook: handleShouldCreatePlaybook,
              callbackCreateDirectory: handleShouldCreateRepository,
              callbackDeleteFile: handleShouldDeleteFile,
            }}
          />
        </Col>
        <Col xs={24} md={18}>
          {selectedFile ? (
            <>
              <FloatingButtonsBar
                onClickSavePlaybook={onClickSavePlaybook}
                onClickDeletePlaybook={onClickDeletePlaybook}
                onClickUndoPlaybook={onClickUndoPlaybook}
                selectedFile={selectedFile}
              />
              <ExtraVarsViewEditor playbook={selectedFile} />
              <Editor
                theme="vs-dark"
                height="90vh"
                //defaultLanguage="yaml"
                language="yaml"
                path={selectedFile?.path || 'playbook.yml'}
                value={downloadedContent}
                onMount={editorDidMount}
              />
            </>
          ) : (
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

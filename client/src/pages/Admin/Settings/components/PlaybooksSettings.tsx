import {
  SimpleIconsGit,
  StreamlineLocalStorageFolderSolid,
} from '@/components/Icons/CustomIcons';
import Title, { SettingsSubTitleColors } from '@/components/Template/Title';
import GitRepositoryModal from '@/pages/Admin/Settings/components/subcomponents/GitRepositoryModal';
import LocalRepositoryModal from '@/pages/Admin/Settings/components/subcomponents/LocalRepositoryModal';
import {
  getGitRepositories,
  getLocalRepositories,
} from '@/services/rest/playbooks-repositories';
import { postUserLogs } from '@/services/rest/usersettings';
import { useModel } from '@@/exports';
import {
  InfoCircleFilled,
  LockFilled,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  InputNumber,
  message,
  Popover,
  Row,
  Slider,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { AddCircleOutline } from 'antd-mobile-icons';
import React, { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

const PlaybookSettings: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [inputValue, setInputValue] = useState<number | null>(
    currentUser?.settings.userSpecific.userLogsLevel.terminal,
  );
  const [gitRepositories, setGitRepositories] = useState<API.GitRepository[]>(
    [],
  );
  const [localRepositories, setLocalRepositories] = useState<
    API.LocalRepository[]
  >([]);
  const asyncFetch = async () => {
    await getGitRepositories().then((list) => {
      if (list?.data) {
        setGitRepositories(list.data);
      }
    });
    await getLocalRepositories().then((list) => {
      if (list?.data) {
        setLocalRepositories(list.data);
      }
    });
  };
  useEffect(() => {
    void asyncFetch();
  }, []);

  const [gitModalOpened, setGitModalOpened] = useState<boolean>(false);
  const [selectedGitRecord, setSelectedGitRecord] = useState<any>();
  const [localModalOpened, setLocalModalOpened] = useState<boolean>(false);
  const [selectedLocalRecord, setSelectedLocalRecord] = useState<any>();

  const onChange = async (newValue: number | null) => {
    if (newValue) {
      await postUserLogs({ terminal: newValue }).then(() => {
        setInputValue(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };
  return (
    <Card>
      <GitRepositoryModal
        repositories={gitRepositories}
        setModalOpened={setGitModalOpened}
        modalOpened={gitModalOpened}
        asyncFetch={asyncFetch}
        selectedRecord={selectedGitRecord}
      />
      <LocalRepositoryModal
        repositories={localRepositories}
        setModalOpened={setLocalModalOpened}
        modalOpened={localModalOpened}
        asyncFetch={asyncFetch}
        selectedRecord={selectedLocalRecord}
      />
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'User Level Logs'}
            backgroundColor={SettingsSubTitleColors.USER_LOGS}
            icon={<UnorderedListOutlined />}
          />
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              <Popover
                content={
                  <>
                    The verbosity level of Ansible output, as described{' '}
                    <a
                      target={'_blank'}
                      href={
                        'https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-v'
                      }
                      rel="noreferrer"
                    >
                      {' '}
                      here
                    </a>
                  </>
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Log level of terminal
            </Typography>{' '}
            <Row>
              <Col span={12}>
                <Slider
                  min={1}
                  max={5}
                  onChange={(newValue) => setInputValue(newValue)}
                  onChangeComplete={onChange}
                  value={typeof inputValue === 'number' ? inputValue : 0}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={1}
                  max={5}
                  style={{ margin: '0 16px' }}
                  value={inputValue}
                  onChange={onChange}
                />
              </Col>
            </Row>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Local Playbook Repositories'}
            backgroundColor={SettingsSubTitleColors.LOCAL}
            icon={<StreamlineLocalStorageFolderSolid />}
          />
        }
        style={{ marginTop: 16 }}
        extra={
          <>
            <Button
              style={{ marginRight: 15 }}
              type={'primary'}
              icon={<AddCircleOutline />}
              onClick={() => {
                setSelectedLocalRecord(undefined);
                setLocalModalOpened(true);
              }}
            >
              Add a new local repository
            </Button>
            <Tooltip title={'Add a local repository'}>
              <InfoCircleFilled />
            </Tooltip>
          </>
        }
      >
        <ProList<API.LocalRepository>
          ghost={true}
          itemCardProps={{
            ghost: true,
          }}
          pagination={
            localRepositories?.length > 8
              ? {
                  defaultPageSize: 8,
                  showSizeChanger: false,
                  showQuickJumper: false,
                }
              : false
          }
          rowSelection={false}
          grid={{ gutter: 0, column: 4 }}
          onItem={(record: API.LocalRepository) => {
            return {
              onMouseEnter: () => {
                console.log(record);
              },
              onClick: () => {
                setSelectedLocalRecord(record);
                setLocalModalOpened(true);
              },
            };
          }}
          metas={{
            title: {
              dataIndex: 'name',
            },
            content: {
              render: (_, row) => (
                <Typography.Text ellipsis={true} color="info">
                  {row.directory}
                </Typography.Text>
              ),
            },
            subTitle: {
              render: (_, row) =>
                row.default ? (
                  <Tag color="info" icon={<LockFilled />}>
                    Default
                  </Tag>
                ) : undefined,
            },
            type: {},
            avatar: {
              render: () => (
                <Avatar src={<StreamlineLocalStorageFolderSolid />} />
              ),
            },
            actions: {
              cardActionProps: 'extra',
            },
          }}
          dataSource={localRepositories}
        />
      </Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Remote Playbook Repositories (GIT)'}
            backgroundColor={SettingsSubTitleColors.GIT}
            icon={<SimpleIconsGit />}
          />
        }
        style={{ marginTop: 16 }}
        extra={
          <>
            <Button
              style={{ marginRight: 15 }}
              type={'primary'}
              icon={<AddCircleOutline />}
              onClick={() => {
                setSelectedGitRecord(undefined);
                setGitModalOpened(true);
              }}
            >
              Add a new remote repository
            </Button>
            <Tooltip
              title={'Add & update your Git repositories for synchronisation'}
            >
              <InfoCircleFilled />
            </Tooltip>
          </>
        }
      >
        <ProList<API.GitRepository>
          ghost={true}
          itemCardProps={{
            ghost: true,
          }}
          pagination={
            gitRepositories?.length > 8
              ? {
                  defaultPageSize: 8,
                  showSizeChanger: false,
                  showQuickJumper: false,
                }
              : false
          }
          rowSelection={false}
          grid={{ gutter: 0, column: 4 }}
          onItem={(record: API.GitRepository) => {
            return {
              onMouseEnter: () => {
                console.log(record);
              },
              onClick: () => {
                setSelectedGitRecord(record);
                setGitModalOpened(true);
              },
            };
          }}
          metas={{
            title: {
              dataIndex: 'name',
            },
            subTitle: {
              render: (_, row) => <Tag color="info">branch:{row.branch}</Tag>,
            },
            content: {
              render: (_, row) => (
                <Typography.Text ellipsis={true} color="info">
                  {row.userName}@{row.remoteUrl}
                </Typography.Text>
              ),
            },
            type: {},
            avatar: {
              render: () => <Avatar src={<SimpleIconsGit />} />,
            },
            actions: {
              cardActionProps: 'extra',
            },
          }}
          dataSource={gitRepositories}
        />
      </Card>
    </Card>
  );
};

export default PlaybookSettings;

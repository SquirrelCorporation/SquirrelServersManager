import {
  ErrorCircleSettings20Regular,
  SimpleIconsGit,
  StreamlineLocalStorageFolderSolid,
  UserSecret,
} from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import CustomVaultModal from '@/pages/Admin/Settings/components/subcomponents/CustomVaultModal';
import PlaybooksGitRepositoryModal from '@/pages/Admin/Settings/components/subcomponents/PlaybooksGitRepositoryModal';
import PlaybooksLocalRepositoryModal from '@/pages/Admin/Settings/components/subcomponents/PlaybooksLocalRepositoryModal';
import { getAnsibleVaults } from '@/services/rest/ansible';
import {
  getGitPlaybooksRepositories,
  getPlaybooksLocalRepositories,
} from '@/services/rest/playbooks-repositories';
import { postUserLogs } from '@/services/rest/usersettings';
import { useModel } from '@@/exports';
import {
  InfoCircleFilled,
  LockFilled,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { history } from '@umijs/max';
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
  const [gitRepositories, setGitRepositories] = useState<
    API.GitPlaybooksRepository[]
  >([]);
  const [localRepositories, setLocalRepositories] = useState<
    API.LocalPlaybooksRepository[]
  >([]);
  const [customVaults, setCustomVaults] = useState<API.AnsibleVault[]>([]);

  const asyncFetch = async () => {
    await getGitPlaybooksRepositories().then((list) => {
      if (list?.data) {
        setGitRepositories(list.data);
      }
    });
    await getPlaybooksLocalRepositories().then((list) => {
      if (list?.data) {
        setLocalRepositories(list.data);
      }
    });
    await getAnsibleVaults().then((list) => {
      if (list?.data) {
        setCustomVaults(list.data);
      }
    });
  };

  useEffect(() => {
    void asyncFetch();
  }, []);

  const [gitModalOpened, setGitModalOpened] = useState<boolean>(false);
  const [selectedGitRecord, setSelectedGitRecord] =
    useState<API.GitPlaybooksRepository>();
  const [localModalOpened, setLocalModalOpened] = useState<boolean>(false);
  const [selectedLocalRecord, setSelectedLocalRecord] =
    useState<API.LocalPlaybooksRepository>();
  const [selectedVaultRecord, setSelectedVaultRecord] =
    useState<API.AnsibleVault>();
  const [vaultModalOpened, setVaultModalOpened] = useState<boolean>(false);

  const onChange = async (newValue: number | null) => {
    if (newValue !== null) {
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
      <PlaybooksGitRepositoryModal
        repositories={gitRepositories}
        setModalOpened={setGitModalOpened}
        modalOpened={gitModalOpened}
        asyncFetch={asyncFetch}
        selectedRecord={selectedGitRecord as API.GitPlaybooksRepository}
      />
      <PlaybooksLocalRepositoryModal
        repositories={localRepositories}
        setModalOpened={setLocalModalOpened}
        modalOpened={localModalOpened}
        asyncFetch={asyncFetch}
        selectedRecord={selectedLocalRecord as API.LocalPlaybooksRepository}
      />
      <CustomVaultModal
        vaults={customVaults}
        setModalOpened={setVaultModalOpened}
        modalOpened={vaultModalOpened}
        asyncFetch={asyncFetch}
        selectedRecord={selectedVaultRecord}
      />
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'User Level Logs'}
            backgroundColor={TitleColors.USER_LOGS}
            icon={<UnorderedListOutlined />}
          />
        }
      >
        <Flex vertical gap={32} style={{ width: '100%' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Typography.Text>
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
              </Typography.Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Slider
                min={1}
                max={5}
                onChange={(value) => setInputValue(value)}
                onAfterChange={onChange}
                value={typeof inputValue === 'number' ? inputValue : 0}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <InputNumber
                min={1}
                max={5}
                style={{ width: '100%' }}
                value={inputValue}
                onChange={onChange}
              />
            </Col>
          </Row>
        </Flex>
      </Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Local Playbook Repositories'}
            backgroundColor={TitleColors.LOCAL}
            icon={<StreamlineLocalStorageFolderSolid />}
          />
        }
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button
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
          </Space>
        }
      >
        <ProList<API.LocalPlaybooksRepository>
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
          grid={{ gutter: 0, xs: 1, sm: 2, md: 2, lg: 2, xl: 4, xxl: 4 }}
          onItem={(record: API.LocalPlaybooksRepository) => {
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
            backgroundColor={TitleColors.GIT}
            icon={<SimpleIconsGit />}
          />
        }
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button
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
              title={'Add & update your Git repositories for synchronization'}
            >
              <InfoCircleFilled />
            </Tooltip>
          </Space>
        }
      >
        <ProList<API.GitPlaybooksRepository>
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
          grid={{ gutter: 0, xs: 1, sm: 2, md: 2, lg: 2, xl: 4, xxl: 4 }}
          onItem={(record: API.GitPlaybooksRepository) => {
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
              render: (_, row) => {
                if (row.onError) {
                  return (
                    <Popover
                      overlayStyle={{ maxWidth: 450 }}
                      content={
                        <Space
                          direction="vertical"
                          size={'small'}
                          style={{ width: '100%' }}
                        >
                          <Typography.Text>
                            This repository is on error:
                          </Typography.Text>
                          <Typography.Text code style={{ fontSize: 13 }}>
                            {row.onErrorMessage}
                          </Typography.Text>
                          <Row justify="end">
                            <Col>
                              <Button
                                onClick={() =>
                                  history.push({
                                    pathname: '/admin/logs',
                                    // @ts-expect-error lib missing type
                                    search: `?moduleId=${row.uuid}`,
                                  })
                                }
                              >
                                More logs
                              </Button>
                            </Col>
                          </Row>
                        </Space>
                      }
                    >
                      <ErrorCircleSettings20Regular
                        style={{ color: 'red', fontSize: 30 }}
                      />
                    </Popover>
                  );
                }
                return undefined;
              },
            },
          }}
          dataSource={gitRepositories}
        />
      </Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Vaults'}
            backgroundColor={TitleColors.SECRET}
            icon={<UserSecret />}
          />
        }
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button
              type={'primary'}
              icon={<AddCircleOutline />}
              onClick={() => {
                setSelectedVaultRecord(undefined);
                setVaultModalOpened(true);
              }}
            >
              Add a new vault
            </Button>
            <Tooltip title={'Add & update your Ansible Vaults'}>
              <InfoCircleFilled />
            </Tooltip>
          </Space>
        }
      >
        <ProList<API.AnsibleVault>
          ghost={true}
          itemCardProps={{
            ghost: true,
          }}
          pagination={
            customVaults?.length > 8
              ? {
                  defaultPageSize: 8,
                  showSizeChanger: false,
                  showQuickJumper: false,
                }
              : false
          }
          rowSelection={false}
          grid={{ gutter: 0, xs: 1, sm: 2, md: 2, lg: 2, xl: 4, xxl: 4 }}
          onItem={(record: API.AnsibleVault) => {
            return {
              onMouseEnter: () => {
                console.log(record);
              },
              onClick: () => {
                setSelectedVaultRecord(record);
                setVaultModalOpened(true);
              },
            };
          }}
          metas={{
            title: {
              dataIndex: 'vaultId',
            },
            avatar: {
              render: () => <Avatar src={<UserSecret />} />,
            },
          }}
          dataSource={customVaults}
        />
      </Card>
    </Card>
  );
};

export default PlaybookSettings;

import {
  ErrorCircleSettings20Regular,
  SimpleIconsGit,
} from '@shared/ui/icons/categories/services';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';
import { PageTitle, TitleColors } from '@shared/ui/templates/PageTitle';
import ContainerStacksGitRepositoryModal from '@/pages/Admin/Settings/components/subcomponents/ContainerStacksGitRepositoryModal';
import { getGitContainerStacksRepositories } from '@/services/rest/container-stacks/repositories';
import { InfoCircleFilled } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { AddCircleOutline } from 'antd-mobile-icons';
import React, { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

const ContainerStacksSettings: React.FC = () => {
  const [gitRepositories, setGitRepositories] = useState<
    API.GitContainerStacksRepository[]
  >([]);

  const asyncFetch = async () => {
    await getGitContainerStacksRepositories().then((list) => {
      if (list?.data) {
        setGitRepositories(list.data);
      }
    });
  };

  useEffect(() => {
    void asyncFetch();
  }, []);

  const [gitModalOpened, setGitModalOpened] = useState<boolean>(false);
  const [selectedGitRecord, setSelectedGitRecord] = useState<any>();

  return (
    <Card>
      <ContainerStacksGitRepositoryModal
        repositories={gitRepositories}
        setModalOpened={setGitModalOpened}
        modalOpened={gitModalOpened}
        asyncFetch={asyncFetch}
        selectedRecord={selectedGitRecord}
      />
      <Card
        type="inner"
        title={
          <PageTitle
            title={'Remote Container Stacks Repositories (GIT)'}
            backgroundColor={TitleColors.GIT}
            icon={<SimpleIconsGit />}
            level={2}
          />
        }
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
            <InfoLinkWidget
              tooltipTitle="Help for remote container stacks repositories."
              documentationLink="https://squirrelserversmanager.io/docs/user-guides/stacks/containers/remote-stacks"
            />
          </Space>
        }
      >
        <ProList<API.GitContainerStacksRepository>
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
          onItem={(record: API.GitContainerStacksRepository) => {
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
                        <Space direction="vertical" size={'small'}>
                          <Typography.Text>
                            This repository is on error:
                          </Typography.Text>
                          <Typography.Text code style={{ fontSize: 13 }}>
                            {row.onErrorMessage}
                          </Typography.Text>
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
    </Card>
  );
};

export default ContainerStacksSettings;

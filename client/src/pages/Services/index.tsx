import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import ContainerMetas from '@/pages/Devices/ContainerMetas';
import AppStoreModal from '@/pages/Services/components/AppStoreModal';
import EditContainerNameModal from '@/pages/Services/components/EditContainerNameModal';
import { getContainers, postRefreshAll } from '@/services/rest/containers';
import { getQueryStringParams } from '@/utils/querystring';
import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  ProList,
} from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Button, Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

const Index: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [
    isEditContainerCustomNameModalOpened,
    setIsEditContainerCustomNameModalOpened,
  ] = useState(false);
  const [appStoreModalOpened, setAppStoreModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<
    API.Container | undefined
  >();
  const [form] = Form.useForm();
  const [refreshAllIsLoading, setRefreshAllIsLoading] = useState(false);
  const { search } = useLocation();
  const query = getQueryStringParams(search);

  useEffect(() => {
    if (query.deviceUuid) {
      form.setFieldsValue({
        device: { uuid: query.deviceUuid },
      });
    }
  }, [query.deviceUuid]);

  const handleRefreshAll = () => {
    setRefreshAllIsLoading(true);
    postRefreshAll()
      .then(() => {
        actionRef?.current?.reload();
      })
      .finally(() => {
        setRefreshAllIsLoading(false);
      });
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Services'}
            backgroundColor={PageContainerTitleColors.PLAYBOOKS}
            icon={<AppstoreOutlined />}
          />
        ),
      }}
    >
      <AppStoreModal
        setOpen={setAppStoreModalOpened}
        open={appStoreModalOpened}
      />
      <EditContainerNameModal
        isEditContainerCustomNameModalOpened={
          isEditContainerCustomNameModalOpened
        }
        setIsEditContainerCustomNameModalOpened={
          setIsEditContainerCustomNameModalOpened
        }
        selectedRecord={selectedRecord}
        actionRef={actionRef}
      />
      <ProList<API.Container>
        size={'large'}
        ghost={false}
        itemCardProps={{
          ghost: false,
        }}
        headerTitle="Containers"
        request={getContainers}
        toolBarRender={() => {
          return [
            <Button
              icon={<AppstoreAddOutlined />}
              key="appstore"
              type="primary"
              disabled={true}
              onClick={() => setAppStoreModalOpened(true)}
            >
              Store
            </Button>,
            <Button
              icon={<ReloadOutlined />}
              key="refresh"
              type="primary"
              loading={refreshAllIsLoading}
              onClick={handleRefreshAll}
            >
              Refresh
            </Button>,
          ];
        }}
        actionRef={actionRef}
        rowKey={'id'}
        pagination={{
          defaultPageSize: 12,
          showSizeChanger: true,
        }}
        search={{
          form: form,
          labelWidth: 140,
          filterType: 'light',
        }}
        showActions="hover"
        rowSelection={false}
        grid={{ gutter: 16, column: 3 }}
        onItem={(record: any) => {
          return {
            onMouseEnter: () => {
              setSelectedRecord(record);
            },
            onClick: () => {
              setSelectedRecord(record);
            },
          };
        }}
        metas={ContainerMetas({
          selectedRecord: selectedRecord,
          setSelectedRecord: setSelectedRecord,
          setIsEditContainerCustomNameModalOpened:
            setIsEditContainerCustomNameModalOpened,
        })}
      />
    </PageContainer>
  );
};

export default Index;

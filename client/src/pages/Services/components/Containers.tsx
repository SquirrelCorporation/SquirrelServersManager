import ContainerMetas from '@/pages/Services/components/containers/ContainerMetas';
import EditContainerNameModal from '@/pages/Services/components/containers/EditContainerNameModal';
import { getContainers, postRefreshAll } from '@/services/rest/containers';
import { ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProList } from '@ant-design/pro-components';
import { useSearchParams } from '@umijs/max';
import { Button, Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

const Containers: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [
    isEditContainerCustomNameModalOpened,
    setIsEditContainerCustomNameModalOpened,
  ] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<
    API.Container | undefined
  >();
  const [form] = Form.useForm();
  const [refreshAllIsLoading, setRefreshAllIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const searchDeviceUuid = searchParams.get('deviceUuid');

  useEffect(() => {
    if (searchDeviceUuid) {
      form.setFieldsValue({
        deviceUuid: searchDeviceUuid,
      });
      form.submit();
    }
  }, [searchDeviceUuid]);

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
    <>
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
          defaultPageSize: 20,
          showSizeChanger: true,
        }}
        search={{
          form: form,
          labelWidth: 140,
          filterType: 'light',
        }}
        showActions="hover"
        rowSelection={false}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
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
    </>
  );
};

export default Containers;

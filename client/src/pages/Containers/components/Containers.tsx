import ContainerDetailsModal from '@/pages/Containers/components/containers/ContainerDetailsModal';
import ContainerMetas from '@/pages/Containers/components/containers/ContainerMetas';
import EditContainerNameModal from '@/pages/Containers/components/containers/EditContainerNameModal';
import { getContainers, postRefreshAll } from '@/services/rest/containers';
import { socket } from '@/socket';
import { ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProList } from '@ant-design/pro-components';
import { useSearchParams } from '@umijs/max';
import { Button, Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API, SsmEvents } from 'ssm-shared-lib';

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
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);

  useEffect(() => {
    if (searchDeviceUuid) {
      form.setFieldsValue({
        deviceUuid: searchDeviceUuid,
      });
      form.submit();
    }
  }, [searchDeviceUuid]);

  const reload = () => {
    actionRef?.current?.reload();
  };

  const handleRefreshAll = () => {
    setRefreshAllIsLoading(true);
    postRefreshAll()
      .then(() => {
        reload();
      })
      .finally(() => {
        setRefreshAllIsLoading(false);
      });
  };

  useEffect(() => {
    socket.connect();
    socket.on(SsmEvents.Update.CONTAINER_CHANGE, reload);

    return () => {
      socket.off(SsmEvents.Update.CONTAINER_CHANGE, reload);
      socket.disconnect();
    };
  }, []);

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
      <ContainerDetailsModal
        setOpenModal={setDetailsModalOpened}
        isOpen={detailsModalOpened}
        selectedRecord={selectedRecord}
      />
      <ProList<API.Container>
        size={'large'}
        ghost={false}
        itemCardProps={{
          ghost: false,
        }}
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
              setDetailsModalOpened(true);
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

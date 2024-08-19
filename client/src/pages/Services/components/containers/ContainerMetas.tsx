import ServiceQuickActionDropDown from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionDropDown';
import ServiceQuickActionReference, {
  ServiceQuickActionReferenceActions,
  ServiceQuickActionReferenceTypes,
} from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionReference';
import ContainerAvatar from '@/pages/Services/components/containers/ContainerAvatar';
import ContainerStatProgress from '@/pages/Services/components/containers/ContainerStatProgress';
import InfoToolTipCard from '@/pages/Services/components/containers/InfoToolTipCard';
import StatusTag from '@/pages/Services/components/containers/StatusTag';
import UpdateAvailableTag from '@/pages/Services/components/containers/UpdateAvailableTag';
import { postContainerAction } from '@/services/rest/containers';
import { getDevices } from '@/services/rest/device';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  ProFieldValueType,
  ProFormSelect,
  ProListMetas,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Flex, message, Popover, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { API, SsmContainer } from 'ssm-shared-lib';

type ContainerMetasProps = {
  selectedRecord?: API.Container;
  setSelectedRecord: React.Dispatch<
    React.SetStateAction<API.Container | undefined>
  >;
  setIsEditContainerCustomNameModalOpened: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};
const ContainerMetas = (props: ContainerMetasProps) => {
  const handleQuickAction = async (idx: number) => {
    if (
      ServiceQuickActionReference[idx].type ===
      ServiceQuickActionReferenceTypes.ACTION
    ) {
      if (
        ServiceQuickActionReference[idx].action ===
        ServiceQuickActionReferenceActions.RENAME
      ) {
        props.setIsEditContainerCustomNameModalOpened(true);
      }
      if (
        ServiceQuickActionReference[idx].action ===
        ServiceQuickActionReferenceActions.LIVE_LOGS
      ) {
        history.push({
          pathname: `/manage/services/logs/${props.selectedRecord?.id}`,
        });
      }
      if (
        Object.values(SsmContainer.Actions).includes(
          ServiceQuickActionReference[idx].action as SsmContainer.Actions,
        )
      ) {
        await postContainerAction(
          props.selectedRecord?.id as string,
          ServiceQuickActionReference[idx].action as SsmContainer.Actions,
        ).then(() => {
          message.info({
            content: `Container : ${ServiceQuickActionReference[idx].action}`,
          });
        });
      }
    }
  };

  return {
    title: {
      search: true,
      title: 'Name',
      dataIndex: 'name',
      render: (_, row) => {
        return (
          <Typography.Text
            ellipsis={{ tooltip: row.customName || row.name }}
            style={{ maxWidth: 140 }}
          >
            {row.customName || row.name}
          </Typography.Text>
        );
      },
    },
    subTitle: {
      search: false,
      render: (_, row) => {
        return (
          <>
            <StatusTag status={row.status} />
            <UpdateAvailableTag updateAvailable={row.updateAvailable} />
          </>
        );
      },
    },
    updateAvailable: {
      dataIndex: 'updateAvailable',
      title: 'Update Available',
      valueType: 'switch' as ProFieldValueType,
    },
    status: {
      dataIndex: 'status',
      title: 'Status',
      valueType: 'select' as ProFieldValueType,
      valueEnum: {
        running: {
          text: 'running',
        },
        paused: {
          text: 'paused',
        },
        unreachable: {
          text: 'unreachable',
        },
      },
    },
    avatar: {
      search: false,
      render: (_, row) => {
        return <ContainerAvatar row={row} key={row.id} />;
      },
    },
    device: {
      search: false,
      dataIndex: ['device', 'uuid'],
    },
    deviceUuid: {
      dataIndex: 'deviceUuid',
      hideInTable: true,
      title: 'Device',
      renderFormItem: () => (
        <ProFormSelect
          request={async () => {
            return await getDevices().then((e: API.DeviceList) => {
              return e.data?.map((f: API.DeviceItem) => {
                return {
                  label: `${f.fqdn} (${f.ip})`,
                  value: f.uuid,
                };
              }) as RequestOptionsType[];
            });
          }}
        />
      ),
    },
    content: {
      search: false,
      render: (_, row) => {
        return (
          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                width: 300,
              }}
            >
              <>
                On{' '}
                <Popover
                  content={
                    <>{row.device?.fqdn} (click to filter on this device)</>
                  }
                >
                  <a href={`?deviceUuid=${row.device?.uuid}`}>
                    <Tag color="black">{row.device?.ip}</Tag>
                  </a>
                </Popover>
                <Flex gap="middle">
                  <ContainerStatProgress containerId={row.id} />
                </Flex>
              </>
            </div>
          </div>
        );
      },
    },
    actions: {
      cardActionProps: 'extra',
      search: false,
      render: (text, row) => [
        <Tooltip
          key={`info-${row.id}`}
          color={'transparent'}
          title={<InfoToolTipCard item={row} />}
        >
          <InfoCircleOutlined style={{ color: 'rgb(22, 104, 220)' }} />
        </Tooltip>,
        <a
          key={`quickAction-${row.id}`}
          onClick={() => {
            props.setSelectedRecord(row);
          }}
        >
          <ServiceQuickActionDropDown onDropDownClicked={handleQuickAction} />
        </a>,
      ],
    },
    id: {
      dataIndex: 'id',
      search: false,
    },
  } as ProListMetas<API.Container>;
};

export default ContainerMetas;

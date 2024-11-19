import ServiceQuickActionDropDown from '@/components/ContainerComponents/ContainerQuickAction/ContainerQuickActionDropDown';
import ServiceQuickActionReference, {
  ServiceQuickActionReferenceActions,
  ServiceQuickActionReferenceTypes,
} from '@/components/ContainerComponents/ContainerQuickAction/ContainerQuickActionReference';
import { ExternalLink } from '@/components/Icons/CustomIcons';
import ContainerAvatar from '@/pages/Containers/components/containers/ContainerAvatar';
import ContainerStatProgress from '@/pages/Containers/components/containers/ContainerStatProgress';
import InfoToolTipCard from '@/pages/Containers/components/containers/InfoToolTipCard';
import StatusTag from '@/pages/Containers/components/containers/StatusTag';
import UpdateAvailableTag from '@/pages/Containers/components/containers/UpdateAvailableTag';
import { postContainerAction } from '@/services/rest/containers';
import { getAllDevices } from '@/services/rest/device';
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
  reload: () => void;
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
          pathname: `/manage/containers/logs/${props.selectedRecord?.id}`,
        });
      }
      if (
        Object.values(SsmContainer.Actions).includes(
          ServiceQuickActionReference[idx].action as SsmContainer.Actions,
        )
      ) {
        message.loading({
          content: `Container: ${ServiceQuickActionReference[idx].action} in progress... The page will be automatically refreshed.`,
          duration: 6,
        });
        await postContainerAction(
          props.selectedRecord?.id as string,
          ServiceQuickActionReference[idx].action as SsmContainer.Actions,
        ).then(() => {
          message.success({
            content: `Container: ${ServiceQuickActionReference[idx].action}`,
            duration: 6,
          });
          return props.reload();
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
      width: 50,
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
            return await getAllDevices().then((e: API.DeviceList) => {
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
        <>
          {row.ports && row.ports.length > 0 && (
            <Tooltip
              key={`url-${row.id}`}
              title={`http://${row.device?.ip}:${row.ports[0].PublicPort}`}
            >
              <a
                href={`http://${row.device?.ip}:${row.ports[0].PublicPort}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink style={{ color: 'rgb(22, 104, 220)' }} />
              </a>
            </Tooltip>
          )}
        </>,
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

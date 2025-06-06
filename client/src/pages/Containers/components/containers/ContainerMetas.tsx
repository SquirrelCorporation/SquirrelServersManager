import ContainerQuickActionDropDown from '@/components/ContainerComponents/ContainerQuickAction/ContainerQuickActionDropDown';
import ServiceQuickActionReference, {
  ServiceQuickActionReferenceActions,
  ServiceQuickActionReferenceTypes,
} from '@/components/ContainerComponents/ContainerQuickAction/ContainerQuickActionReference';
import { ExternalLink } from '@/components/Icons/CustomIcons';
import ContainerTypeIcon from '@/pages/Containers/components/containers/container-details/ContainerTypeIcon';
import ContainerAvatar from '@/pages/Containers/components/containers/ContainerAvatar';
import ContainerStatProgress from '@/pages/Containers/components/containers/ContainerStatProgress';
import InfoToolTipCard from '@/pages/Containers/components/containers/InfoToolTipCard';
import StatusTag from '@/pages/Containers/components/containers/StatusTag';
import UpdateAvailableTag from '@/pages/Containers/components/containers/UpdateAvailableTag';
import { postDockerContainerAction } from '@/services/rest/containers/containers';
import { getAllDevices } from '@/services/rest/devices/devices';
import { capitalizeFirstLetter } from '@/utils/strings';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  ProFieldValueType,
  ProFormSelect,
  ProListMetas,
  RequestOptionsType,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import message from '@/components/Message/DynamicMessage';
import { Flex, Popover, Tag, Tooltip, Typography } from 'antd';
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

const tagStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontWeight: 500,
};

const ContainerMetas = ({
  selectedRecord,
  setSelectedRecord,
  setIsEditContainerCustomNameModalOpened,
  reload,
}: ContainerMetasProps) => {
  const handleQuickAction = async (idx: number) => {
    if (
      ServiceQuickActionReference[idx].type ===
      ServiceQuickActionReferenceTypes.ACTION
    ) {
      if (
        ServiceQuickActionReference[idx].action ===
        ServiceQuickActionReferenceActions.RENAME
      ) {
        setIsEditContainerCustomNameModalOpened(true);
      }
      if (
        ServiceQuickActionReference[idx].action ===
        ServiceQuickActionReferenceActions.LIVE_LOGS
      ) {
        history.push({
          pathname: `/manage/containers/logs/${selectedRecord?.id}`,
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
        await postDockerContainerAction(
          selectedRecord?.id as string,
          ServiceQuickActionReference[idx].action as SsmContainer.Actions,
        ).then(() => {
          message.success({
            content: `Container: ${ServiceQuickActionReference[idx].action}`,
            duration: 6,
          });
          return reload();
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
            {row.displayType === SsmContainer.ContainerTypes.DOCKER && (
              <UpdateAvailableTag updateAvailable={row.updateAvailable} />
            )}
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
      valueType: 'checkbox' as ProFieldValueType,
      initialValue: ['running', 'paused', 'unreachable', 'stopped'],
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
        stopped: {
          text: 'stopped',
        },
        exited: {
          text: 'exited',
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
          <div style={{ flex: 1 }}>
            <>
              <Popover content={capitalizeFirstLetter(row.displayType)}>
                <ContainerTypeIcon displayType={row.displayType} />
              </Popover>
              <Popover
                content={
                  <>{row.device?.fqdn} (click to filter on this device)</>
                }
              >
                <a href={`?deviceUuid=${row.device?.uuid}`}>
                  <Tag color="black" style={tagStyle}>
                    {row.device?.ip}
                  </Tag>
                </a>
              </Popover>
              {row.displayType === SsmContainer.ContainerTypes.DOCKER && (
                <ContainerStatProgress containerId={row.id} />
              )}
            </>
          </div>
        );
      },
    },
    actions: {
      cardActionProps: 'extra',
      search: false,
      render: (text, row) => [
        row.displayType === SsmContainer.ContainerTypes.DOCKER
          ? ((
              <>
                {row.ports &&
                  row.ports.length > 0 &&
                  row.ports[0].PublicPort && (
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
              </>
            ),
            (
              <Popover
                key={`info-${row.id}`}
                content={<InfoToolTipCard item={row} />}
              >
                <InfoCircleOutlined style={{ color: 'rgb(22, 104, 220)' }} />
              </Popover>
            ))
          : [],
        <a
          key={`quickAction-${row.id}`}
          onClick={() => {
            setSelectedRecord(row);
          }}
        >
          <ContainerQuickActionDropDown
            onDropDownClicked={handleQuickAction}
            container={row}
          />
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

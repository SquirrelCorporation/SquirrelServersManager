import ServiceQuickActionDropDown from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionDropDown';
import ServiceQuickActionReference, {
  ServiceQuickActionReferenceActions,
  ServiceQuickActionReferenceTypes,
} from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionReference';
import ContainerAvatar from '@/pages/Services/components/ContainerAvatar';
import ContainerStatProgress from '@/pages/Services/components/ContainerStatProgress';
import InfoToolTipCard from '@/pages/Services/components/InfoToolTipCard';
import StatusTag from '@/pages/Services/components/StatusTag';
import UpdateAvailableTag from '@/pages/Services/components/UpdateAvailableTag';
import { postContainerAction } from '@/services/rest/containers';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ProFieldValueType, ProListMetas } from '@ant-design/pro-components';
import { Flex, message, Popover, Tag, Tooltip } from 'antd';
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
        return row.customName || row.name;
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
      },
    },
    avatar: {
      search: false,
      render: (_, row) => {
        return <ContainerAvatar row={row} key={row.id} />;
      },
    },
    device: {
      title: 'Device',
      search: true,
      dataIndex: ['device', 'uuid'],
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
                <Popover content={row.device?.fqdn}>
                  <Tag color="black">{row.device?.ip}</Tag>
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

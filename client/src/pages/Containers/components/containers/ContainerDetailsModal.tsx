import { Details, Live24Filled } from '@/components/Icons/CustomIcons';
import DockerContainerDetails from '@/pages/Containers/components/containers/container-details/DockerContainerDetails';
import ProxmoxContainerDetails from '@/pages/Containers/components/containers/container-details/ProxmoxContainerDetails';
import {
  postDockerContainerAction,
  postProxmoxContainerAction,
} from '@/services/rest/containers';
import {
  CloseCircleOutlined,
  PauseOutlined,
  PlayCircleFilled,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Divider, message, Modal } from 'antd';
import React from 'react';
import { API, SsmContainer } from 'ssm-shared-lib';

type ContainerDetailsModalProps = {
  selectedRecord?: API.Container;
  setOpenModal: (open: boolean) => void;
  isOpen: boolean;
};

const ContainerDetailsModal: React.FC<ContainerDetailsModalProps> = ({
  setOpenModal,
  isOpen,
  selectedRecord,
}) => {
  if (!selectedRecord) {
    return;
  }
  const handleAction = async (action: SsmContainer.Actions) => {
    if (selectedRecord.displayType === SsmContainer.ContainerTypes.DOCKER) {
      await postDockerContainerAction(
        selectedRecord?.id as string,
        action,
      ).then(() => {
        message.info({
          content: `Container : ${action}`,
        });
      });
    }
    if (selectedRecord.displayType === SsmContainer.ContainerTypes.PROXMOX) {
      await postProxmoxContainerAction(
        selectedRecord?.uuid as string,
        action,
      ).then(() => {
        message.info({
          content: `Container : ${action}`,
        });
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onOk={() => setOpenModal(false)}
      onCancel={() => setOpenModal(false)}
      title={
        <>
          <Details /> Container Details
        </>
      }
      destroyOnClose
      width={800}
      footer={(_, extra) => (
        <>
          <Button.Group style={{ marginRight: 15 }}>
            {selectedRecord.displayType ===
              SsmContainer.ContainerTypes.DOCKER && (
              <Button
                icon={<Live24Filled />}
                onClick={() => {
                  history.push({
                    pathname: `/manage/containers/logs/${selectedRecord?.id}`,
                  });
                }}
              >
                Live Logs
              </Button>
            )}
            <Button
              icon={<StopOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.STOP)}
            >
              Stop
            </Button>
            <Button
              icon={<PlayCircleFilled />}
              onClick={() => handleAction(SsmContainer.Actions.START)}
            >
              Start
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.RESTART)}
            >
              Restart
            </Button>
            <Button
              icon={<PauseOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.PAUSE)}
            >
              Pause
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              onClick={() => handleAction(SsmContainer.Actions.KILL)}
            >
              Kill
            </Button>
          </Button.Group>
          <extra.OkBtn />
        </>
      )}
    >
      {selectedRecord.displayType === SsmContainer.ContainerTypes.DOCKER && (
        <DockerContainerDetails container={selectedRecord} />
      )}
      {selectedRecord.displayType === SsmContainer.ContainerTypes.PROXMOX && (
        <ProxmoxContainerDetails container={selectedRecord} />
      )}
      <Divider dashed />
    </Modal>
  );
};

export default ContainerDetailsModal;

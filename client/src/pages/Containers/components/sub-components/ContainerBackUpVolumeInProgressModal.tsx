import { BackupSolid } from '@/components/Icons/CustomIcons';
import {
  getBackUpVolume,
  postBackUpVolume,
} from '@/services/rest/containers/container-volumes';
import { containerVolumesSocket as socket } from '@/socket';
import { Button, Flex, message, Modal, Result, Spin } from 'antd';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { SsmContainer, SsmEvents } from 'ssm-shared-lib';

type ContainerBackUpVolumeInProgressModalProps = {
  setInProgress: Dispatch<
    SetStateAction<{
      visible: boolean;
      mode: SsmContainer.VolumeBackupMode | undefined;
    }>
  >;
  inProgress: {
    visible: boolean;
    mode: SsmContainer.VolumeBackupMode | undefined;
  };
  volumeUuid: string;
};

enum BackupResult {
  SUCCESS = 'success',
  ERROR = 'error',
}

const ContainerBackUpVolumeInProgressModal: React.FC<
  ContainerBackUpVolumeInProgressModalProps
> = ({ setInProgress, inProgress, volumeUuid }) => {
  const [isFinished, setIsFinished] = React.useState<string | undefined>();
  const [backupInfo, setBackupInfo] = React.useState<
    { fileName: string; mode: SsmContainer.VolumeBackupMode } | undefined
  >();

  useEffect(() => {
    socket.connect();
    socket.on(SsmEvents.VolumeBackup.PROGRESS, onVolumeBackupProgress);

    return () => {
      socket.off(SsmEvents.VolumeBackup.PROGRESS, onVolumeBackupProgress);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (inProgress?.visible === true) {
      setBackupInfo(undefined);
      setIsFinished(undefined);
      postBackUpVolume(
        volumeUuid,
        inProgress.mode as SsmContainer.VolumeBackupMode,
      )
        .then((e) => {
          setBackupInfo({ fileName: e.data.fileName, mode: e.data.mode });
          void message.loading({ content: 'Backup in progress', duration: 2 });
        })
        .catch(() => {
          setIsFinished(BackupResult.ERROR);
        });
    }
  }, [inProgress]);

  useEffect(() => {
    if (
      isFinished === BackupResult.SUCCESS &&
      backupInfo?.mode === SsmContainer.VolumeBackupMode.BROWSER
    ) {
      getBackUpVolume({ fileName: backupInfo?.fileName as string }).then(
        (res) => {
          const blob = new Blob([res]);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', backupInfo?.fileName);
          document.body.appendChild(link);
          link.click();
        },
      );
    }
  }, [backupInfo, isFinished]);

  const onVolumeBackupProgress = (payload: any) => {
    if (payload.success) {
      setIsFinished(BackupResult.SUCCESS);
    } else {
      setIsFinished(BackupResult.ERROR);
    }
  };

  return (
    <Modal
      open={inProgress?.visible}
      onCancel={() => setInProgress({ visible: false, mode: undefined })}
      title={
        <>
          <BackupSolid /> Backup In Progress
        </>
      }
      footer={null}
      destroyOnClose={true}
    >
      {!isFinished && (
        <Flex
          gap="middle"
          vertical
          justify={'center'}
          style={{ marginTop: 50, marginBottom: 50 }}
        >
          <Spin tip="Exporting" size="large">
            <div
              style={{
                padding: 50,
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: 4,
              }}
            />
          </Spin>
        </Flex>
      )}
      {isFinished === BackupResult.SUCCESS && (
        <Result
          title="Backup completed"
          subTitle="Your backup is ready to be downloaded"
          extra={
            <Button
              key="console"
              type="primary"
              onClick={() => {
                setInProgress({ visible: false, mode: undefined });
              }}
            >
              Close
            </Button>
          }
        />
      )}
      {isFinished === BackupResult.ERROR && (
        <Result
          status="error"
          title="Backup failed"
          subTitle="Check the docker configuration and the server logs"
          extra={
            <Button
              key="console"
              type="primary"
              onClick={() => {
                setInProgress({ visible: false, mode: undefined });
              }}
            >
              Close
            </Button>
          }
        />
      )}
    </Modal>
  );
};

export default ContainerBackUpVolumeInProgressModal;

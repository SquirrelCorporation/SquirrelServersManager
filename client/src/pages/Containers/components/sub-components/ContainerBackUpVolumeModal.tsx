import {
  BackupSolid,
  BrowserLtr,
  FileSystem,
} from '@/components/Icons/CustomIcons';
import ContainerBackUpVolumeInProgressModal from '@/pages/Containers/components/sub-components/ContainerBackUpVolumeInProgressModal';
import { CheckCard, ModalForm, ProForm } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Avatar, Button, Card, Typography } from 'antd';
import React from 'react';
import { SsmContainer } from 'ssm-shared-lib';

type ContainerBackUpVolumeModalProps = {
  volumeUuid: string;
};

const ContainerBackUpVolumeModal: React.FC<ContainerBackUpVolumeModalProps> = ({
  volumeUuid,
}) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [inProgressModal, setInProgressModal] = React.useState({
    visible: false,
    mode: SsmContainer.VolumeBackupMode.FILE_SYSTEM,
  });

  return (
    <>
      <ContainerBackUpVolumeInProgressModal
        inProgress={inProgressModal}
        setInProgress={setInProgressModal}
        volumeUuid={volumeUuid}
      />
      <ModalForm
        title={
          <>
            <BackupSolid /> Backup the volume
          </>
        }
        autoFocusFirstInput
        trigger={
          <Button>
            <BackupSolid />
            Backup
          </Button>
        }
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={async (values) => {
          setInProgressModal({ visible: true, mode: values.mode });
          return true;
        }}
      >
        <Card title={'Backup mode'}>
          <ProForm.Item
            name="mode"
            style={{ width: '100%' }}
            initialValue={SsmContainer.VolumeBackupMode.FILE_SYSTEM}
          >
            <CheckCard.Group style={{ width: '100%' }}>
              <CheckCard
                title="Filesystem"
                value={SsmContainer.VolumeBackupMode.FILE_SYSTEM}
                avatar={<Avatar src={<FileSystem />} size="small" />}
                description={
                  <Typography.Text
                    style={{
                      fontSize: 'x-small',
                      color: 'rgba(255, 255, 255, 0.65)',
                    }}
                  >
                    Save on SSM&#39;s host file system{' '}
                    {currentUser?.settings?.ssmDataPath}/backup/volumes/
                  </Typography.Text>
                }
              />
              <CheckCard
                title="Browser"
                avatar={<Avatar src={<BrowserLtr />} size="small" />}
                value={SsmContainer.VolumeBackupMode.BROWSER}
                description={
                  <Typography.Text
                    style={{
                      fontSize: 'x-small',
                      color: 'rgba(255, 255, 255, 0.65)',
                    }}
                  >
                    Download directly on your browser.
                  </Typography.Text>
                }
              />
            </CheckCard.Group>
          </ProForm.Item>
        </Card>
      </ModalForm>
    </>
  );
};

export default ContainerBackUpVolumeModal;

import { updateContainerCustomName } from '@/services/rest/containers/containers';
import { ActionType, ModalForm, ProFormText } from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import React from 'react';
import { API } from 'ssm-shared-lib';

type EditContainerNameModalProps = {
  isEditContainerCustomNameModalOpened: boolean;
  setIsEditContainerCustomNameModalOpened: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  selectedRecord?: API.Container;
  actionRef: React.MutableRefObject<ActionType | undefined>;
};

const EditContainerNameModal: React.FC<EditContainerNameModalProps> = ({
  isEditContainerCustomNameModalOpened,
  setIsEditContainerCustomNameModalOpened,
  selectedRecord,
  actionRef,
}) => {
  return (
    <ModalForm<{ customName: string }>
      title={`Edit container name`}
      open={isEditContainerCustomNameModalOpened}
      autoFocusFirstInput
      clearOnDestroy
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setIsEditContainerCustomNameModalOpened(false),
      }}
      onFinish={async (values) => {
        if (!selectedRecord) {
          message.error({ content: 'Internal error, no selected record' });
          return;
        }
        if (selectedRecord?.id) {
          await updateContainerCustomName(values.customName, selectedRecord.id);
          actionRef?.current?.reload();
          setIsEditContainerCustomNameModalOpened(false);
          message.success({ content: 'Container properties updated' });
        }
        return true;
      }}
    >
      <ProFormText
        name={'customName'}
        label={'Name'}
        initialValue={selectedRecord?.customName || selectedRecord?.name}
      />
    </ModalForm>
  );
};
export default EditContainerNameModal;

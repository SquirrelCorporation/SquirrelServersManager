import { updateContainerCustomName } from '@/services/rest/containers';
import { ActionType, ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
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

const EditContainerNameModal: React.FC<EditContainerNameModalProps> = (
  props,
) => {
  return (
    <ModalForm<{ customName: string }>
      title={`Edit container name`}
      open={props.isEditContainerCustomNameModalOpened}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.setIsEditContainerCustomNameModalOpened(false),
      }}
      onFinish={async (values) => {
        if (!props.selectedRecord) {
          message.error({ content: 'Internal error, no selected record' });
          return;
        }
        if (props.selectedRecord?.id) {
          await updateContainerCustomName(
            values.customName,
            props.selectedRecord.id,
          );
          props.actionRef?.current?.reload();
          props.setIsEditContainerCustomNameModalOpened(false);
          message.success({ content: 'Container properties updated' });
        }
        return true;
      }}
    >
      <ProFormText
        name={'customName'}
        label={'Name'}
        initialValue={
          props.selectedRecord?.customName || props.selectedRecord?.name
        }
      />
    </ModalForm>
  );
};
export default EditContainerNameModal;

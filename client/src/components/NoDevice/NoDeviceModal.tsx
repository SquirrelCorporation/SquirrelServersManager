import NewDeviceModal from '@/components/NewDeviceModal/NewDeviceModal';
import CarouselNoDevice from '@/components/NoDevice/CarouselNoDevice';
import TerminalModal, {
  TerminalStateProps,
} from '@/components/PlaybookExecutionModal';
import { Button, Modal, Typography } from 'antd';
import { useState } from 'react';
import { API, SsmAgent, SsmAnsible } from 'ssm-shared-lib';
import { history } from '@umijs/max';

const MODAL_WIDTH = 800;
const MANAGE_DEVICES_PATH = '/manage/devices';

const NoDeviceModal = () => {
  const [addNewDeviceModalIsOpen, setAddNewDeviceModalIsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [terminal, setTerminal] = useState<TerminalStateProps>({
    target: undefined,
    isOpen: false,
    command: undefined,
    playbookName: undefined,
    mode: SsmAnsible.ExecutionMode.APPLY,
  });
  const openOrCloseTerminalModal = (open: boolean) => {
    setTerminal({ ...terminal, isOpen: open });
  };

  const onAddNewDevice = (
    target: API.DeviceItem,
    installMethod: SsmAgent.InstallMethods,
  ) => {
    if (installMethod !== SsmAgent.InstallMethods.LESS) {
      setTerminal({
        target: [target],
        isOpen: true,
        quickRef: 'installAgent',
        extraVars: [{ extraVar: '_ssm_installMethod', value: installMethod }],
      });
    } else {
      history.push(MANAGE_DEVICES_PATH);
    }
  };

  const handleOk = () => {
    setIsOpen(false);
    setAddNewDeviceModalIsOpen(true);
  };

  return (
    <>
      <TerminalModal
        terminalProps={{ ...terminal, setIsOpen: openOrCloseTerminalModal }}
      />
      <NewDeviceModal
        isModalOpen={addNewDeviceModalIsOpen}
        setIsModalOpen={setAddNewDeviceModalIsOpen}
        onAddNewDevice={onAddNewDevice}
      />
      <Modal
        width={MODAL_WIDTH}
        title={'You made it!'}
        open={isOpen}
        footer={[
          <Button key="link" type="primary" onClick={handleOk}>
            Add my first device
          </Button>,
        ]}
      >
        <Typography.Paragraph>
          Thanks for trying Squirrel Servers Manager, we hope you will enjoy
          managing your servers with ease!
        </Typography.Paragraph>
        <CarouselNoDevice />
      </Modal>
    </>
  );
};

export default NoDeviceModal;

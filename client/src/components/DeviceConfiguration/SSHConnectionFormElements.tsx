import AdvancedSwitch from '@/components/DeviceConfiguration/AdvancedSwitch';
import AuthenticationCard from '@/components/DeviceConfiguration/ssh/AuthenticationCard';
import HostCard from '@/components/DeviceConfiguration/ssh/HostCard';
import SuperUserCard from '@/components/DeviceConfiguration/ssh/SuperUserCard';
import { ProFormInstance } from '@ant-design/pro-components';
import React from 'react';

export type SSHConnectionFormElementsProps = {
  deviceIp?: string;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
};

const SSHConnectionFormElements: React.FC<SSHConnectionFormElementsProps> = ({
  deviceIp,
  formRef,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const toggleShowAdvanced = () => setShowAdvanced(!showAdvanced);

  return (
    <>
      <HostCard deviceIp={deviceIp} showAdvanced={showAdvanced} />
      <SuperUserCard formRef={formRef} />
      <AuthenticationCard formRef={formRef} />
      <AdvancedSwitch
        showAdvanced={showAdvanced}
        toggleShowAdvanced={toggleShowAdvanced}
      />
    </>
  );
};

export default SSHConnectionFormElements;

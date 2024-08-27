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

const SSHConnectionFormElements: React.FC<SSHConnectionFormElementsProps> = (
  props,
) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const toggleShowAdvanced = () => setShowAdvanced(!showAdvanced);

  return (
    <>
      <HostCard deviceIp={props.deviceIp} showAdvanced={showAdvanced} />
      <SuperUserCard formRef={props.formRef} />
      <AuthenticationCard formRef={props.formRef} />
      <AdvancedSwitch
        showAdvanced={showAdvanced}
        toggleShowAdvanced={toggleShowAdvanced}
      />
    </>
  );
};

export default SSHConnectionFormElements;

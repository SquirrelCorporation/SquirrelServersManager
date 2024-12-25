import ExistingDeviceAdvancedDiagnostic from '@/components/DeviceConfiguration/diagnostic/ExistingDeviceAdvancedDiagnostic';
import ExistingDeviceConnectionTest from '@/components/DeviceConfiguration/diagnostic/ExistingDeviceConnectionTest';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type ConnectionTestTabProps = {
  device: Partial<API.DeviceItem>;
};

const DiagnosticTab: React.FC<ConnectionTestTabProps> = (props) => (
  <>
    <ExistingDeviceConnectionTest device={props.device} />
    <ExistingDeviceAdvancedDiagnostic device={props.device} />
  </>
);

export default DiagnosticTab;

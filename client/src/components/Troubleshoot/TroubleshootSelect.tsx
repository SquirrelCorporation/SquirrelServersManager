import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';

type TroubleshootSelectProps = {
  request: () => Promise<any>;
  label: string;
};

const TroubleshootSelect: React.FC<TroubleshootSelectProps> = ({
  request,
  label,
}) => {
  return (
    <>
      <ProFormSelect
        request={request}
        label={label}
        name={'troubleshoot_select'}
      />
    </>
  );
};

export default TroubleshootSelect;

import {
  ArrowsDoubleSeNw,
  InputIcon,
  ObservedLightning,
} from '@/components/Icons/CustomIcons';
import React from 'react';
import { SsmAnsible } from 'ssm-shared-lib';

export const getExtraVarTooltipTitle = (
  type: SsmAnsible.ExtraVarsType,
  overridable?: boolean,
) => {
  switch (type) {
    case SsmAnsible.ExtraVarsType.MANUAL:
      return 'MANUAL variable. Filled before each execution, or you can define it when creating an automation.';
    case SsmAnsible.ExtraVarsType.SHARED:
      return `SHARED variable. A variable stored in the database, available across playbooks and sharing the same value. ${overridable ? 'Can be overridden for this process by simply entering a custom value. You can also change the saved value globally by clicking on Overwrite.' : ''}`;
    case SsmAnsible.ExtraVarsType.CONTEXT:
      return 'CONTEXT variable. A variable that is filled automatically by SSM during the run of the playbook.';
    default:
      return 'Unknown type';
  }
};

const ExtraVarIcon = ({
  extraVarType,
  style,
}: {
  extraVarType: SsmAnsible.ExtraVarsType | null;
  style?: any;
}) => {
  switch (extraVarType) {
    case SsmAnsible.ExtraVarsType.SHARED:
      return <ArrowsDoubleSeNw style={style} />;
    case SsmAnsible.ExtraVarsType.MANUAL:
      return <InputIcon style={style} />;
    case SsmAnsible.ExtraVarsType.CONTEXT:
      return <ObservedLightning style={style} />;
    default:
      return;
  }
};

export default ExtraVarIcon;

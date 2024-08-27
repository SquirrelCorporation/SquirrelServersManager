import { Flex, Space, Switch } from 'antd';
import React from 'react';

const MARGIN_BOTTOM_STYLE = { marginBottom: 10 };
const SWITCH_ALIGNMENT_STYLE = { marginLeft: 'auto' };

const AdvancedSwitch: React.FC<{
  showAdvanced: boolean;
  toggleShowAdvanced: () => void;
}> = ({ showAdvanced, toggleShowAdvanced }) => (
  <Flex style={MARGIN_BOTTOM_STYLE}>
    <Space direction="horizontal" size="middle" style={SWITCH_ALIGNMENT_STYLE}>
      Show advanced
      <Switch
        size="small"
        checked={showAdvanced}
        onChange={toggleShowAdvanced}
      />
    </Space>
  </Flex>
);

export default AdvancedSwitch;

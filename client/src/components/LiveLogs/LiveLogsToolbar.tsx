import { Button, DatePicker, DatePickerProps, Flex } from 'antd';
import React from 'react';

const LiveLogsToolbar = () => {
  const onOk = (value: DatePickerProps['value']) => {
    console.log('onOk: ', value);
  };
  return (
    <Flex justify={'flex-end'} align={'center'} gap={32}>
      <DatePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        onChange={(value, dateString) => {
          console.log('Selected Time: ', value);
          console.log('Formatted Selected Time: ', dateString);
        }}
        onOk={onOk}
      />
      <Button>Stop</Button>

      <Button>Reset</Button>
    </Flex>
  );
};

export default LiveLogsToolbar;

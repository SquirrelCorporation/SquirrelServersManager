import { PauseCircleFilled, StopFilled, StopOutlined } from '@ant-design/icons';
import { Button, DatePicker, DatePickerProps, Flex } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

type LiveLogsToolbarProps = {
  onStop: () => void;
  fromDate: number;
  setFromDate: any;
};

const LiveLogsToolbar: React.FC<LiveLogsToolbarProps> = ({
  onStop,
  setFromDate,
  fromDate,
}) => {
  const onOk = (value: DatePickerProps['value']) => {
    setFromDate(value?.unix());
  };
  return (
    <Flex justify={'flex-end'} align={'center'} gap={32}>
      <DatePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        value={dayjs.unix(fromDate)}
        onChange={(value, dateString) => {
          console.log('Selected Time: ', value);
          console.log('Formatted Selected Time: ', dateString);
        }}
        onOk={onOk}
      />
      <Button icon={<StopOutlined />} type={'primary'} onClick={onStop}>
        Stop
      </Button>
    </Flex>
  );
};

export default LiveLogsToolbar;

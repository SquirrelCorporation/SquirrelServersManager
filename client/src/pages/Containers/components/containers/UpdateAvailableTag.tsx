import { Update } from '@/components/Icons/CustomIcons';
import { Badge, Tag, Tooltip } from 'antd';
import React from 'react';

export type UpdateAvailableTagProps = {
  updateAvailable?: boolean;
};

const UpdateAvailableTag: React.FC<UpdateAvailableTagProps> = ({
  updateAvailable,
}) => {
  return updateAvailable ? (
    <Tooltip title={'Update available'}>
      <Tag
        color="cyan"
        icon={
          <Badge dot={true} color="info">
            <Update />{' '}
          </Badge>
        }
      />
    </Tooltip>
  ) : (
    <></>
  );
};

export default UpdateAvailableTag;

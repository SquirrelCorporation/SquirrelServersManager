import { Tag } from 'antd';
import React from 'react';

export type UpdateAvailableTagProps = {
  updateAvailable?: boolean;
};

const UpdateAvailableTag: React.FC<UpdateAvailableTagProps> = (
  props: UpdateAvailableTagProps,
) => {
  return props.updateAvailable ? (
    <Tag color="cyan">Update available</Tag>
  ) : (
    <></>
  );
};

export default UpdateAvailableTag;

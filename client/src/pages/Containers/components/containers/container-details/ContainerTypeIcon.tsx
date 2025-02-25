import { Proxmox } from '@/components/Icons/CustomIcons';
import { DockerOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import React from 'react';
import { SsmContainer } from 'ssm-shared-lib';

export type ContainerTypeIconProps = {
  displayType: SsmContainer.ContainerTypes;
};

const ContainerTypeIcon: React.FC<ContainerTypeIconProps> = ({
  displayType,
}) => {
  let icon;
  if (displayType === SsmContainer.ContainerTypes.DOCKER) {
    icon = <DockerOutlined />;
  }
  if (displayType === SsmContainer.ContainerTypes.PROXMOX) {
    icon = <Proxmox />;
  }
  return <Tag color="geekblue" icon={icon} />;
};

export default ContainerTypeIcon;

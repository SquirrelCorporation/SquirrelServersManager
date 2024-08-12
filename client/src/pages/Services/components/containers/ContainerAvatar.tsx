import { Avatar } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const colorPalette = [
  '#f56a00',
  '#234398',
  '#801872',
  '#807718',
  '#476e2f',
  '#804018',
  '#238f26',
  '#188030',
  '#7e7123',
  '#801843',
  '#561880',
  '#19554e',
  '#184280',
  '#187780',
];

const hashCode = (str: string) => {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

type ContainerAvatarProps = {
  row: API.Container;
};
const ContainerAvatar: React.FC<ContainerAvatarProps> = (props) => {
  const { row } = props;

  const getName = () => {
    try {
      return row.customName?.slice(0, 3) || row.name?.slice(0, 3);
    } catch (error: any) {
      return 'undefined';
    }
  };
  return (
    <Avatar
      size={{ xs: 24, sm: 50, md: 50, lg: 50, xl: 50, xxl: 50 }}
      shape="square"
      style={{
        marginRight: 4,
        fontSize: 15,
        backgroundColor:
          colorPalette[(row.id ? hashCode(row.id) : 0) % colorPalette.length],
      }}
    >
      {getName()}
    </Avatar>
  );
};

export default ContainerAvatar;

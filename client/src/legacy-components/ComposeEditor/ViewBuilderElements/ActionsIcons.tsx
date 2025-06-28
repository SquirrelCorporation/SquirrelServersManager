import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import React from 'react';

interface IconProps {
  onClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

export const RemoveIcon: React.FC<IconProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <DeleteOutlined
      onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
        onClick(event);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ color: isHovered ? 'rgb(23, 125, 220)' : 'inherit' }}
    />
  );
};

export const AddIcon: React.FC<IconProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <PlusOutlined
      onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
        onClick(event);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ color: isHovered ? 'rgb(23, 125, 220)' : 'inherit' }}
    />
  );
};

export const MinusIcon: React.FC<IconProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <MinusCircleOutlined
      onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
        onClick(event);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: isHovered ? 'rgb(23, 125, 220)' : 'inherit',
        cursor: 'pointer',
        fontSize: '18px',
      }}
    />
  );
};

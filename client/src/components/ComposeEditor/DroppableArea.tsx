// components/DroppableArea.tsx
import { useDroppable } from '@dnd-kit/core';
import React, { ReactNode } from 'react';

type DroppableAreaProps = {
  id: string;
  allowedDraggables: string[];
  children: ReactNode;
};

const DroppableArea: React.FC<DroppableAreaProps> = ({
  id,
  allowedDraggables,
  children,
}) => {
  const { isOver, setNodeRef, active } = useDroppable({ id });

  let backgroundColor;
  if (isOver) {
    const draggableId = active ? active.id : '';
    backgroundColor = allowedDraggables.includes(`${draggableId}`)
      ? 'rgba(0, 255, 0, 0.2)'
      : 'rgba(255, 0, 0, 0.2)';
  }

  const style = {
    backgroundColor,
    borderRadius: '8px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

export default DroppableArea;

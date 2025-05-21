import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DndProviderProps {
  children: React.ReactNode;
}

// This is a wrapper component to ensure the DndProvider is only mounted once
// and to handle any potential issues with module federation
const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  return (
    <ReactDndProvider backend={HTML5Backend}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;
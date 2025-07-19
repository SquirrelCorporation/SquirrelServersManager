import React from 'react';

interface DebugOverlayProps {
  fileName: string;
  componentName: string;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ fileName, componentName }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        fontSize: '10px',
        padding: '2px 4px',
        zIndex: 9999,
        fontFamily: 'monospace',
        borderTop: '1px solid red',
      }}
    >
      <div>{fileName}</div>
      <div>{componentName}</div>
    </div>
  );
};

export default DebugOverlay;
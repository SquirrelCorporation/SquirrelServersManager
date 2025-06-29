import { Skeleton, Tooltip } from 'antd';
import React, { useState } from 'react';

interface CountDisplayProps {
  count: number | null | undefined; // The numerical count to display
  size?: number; // Size of the square
  isLoading: boolean;
  tooltipText?: string; // Optional tooltip
  label?: string; // Re-add label prop
  errorText?: string; // Text to display on error/NaN
}

const CountDisplay: React.FC<CountDisplayProps> = ({
  count,
  size = 50,
  isLoading,
  tooltipText,
  label, // Re-add label prop
  errorText = 'N/A',
}) => {
  const [isHovered, setIsHovered] = useState(false); // Hover state

  const renderContent = () => {
    if (isLoading) {
      // Use Skeleton matching the approximate size, maybe square?
      return (
        <Skeleton.Node active style={{ width: size, height: size }}>
          <div />
        </Skeleton.Node>
      );
      // Or keep Skeleton.Avatar if preferred
      // return <Skeleton.Avatar active size={size} shape="square" />;
    }

    const displayValue =
      count === null || count === undefined || isNaN(count) ? errorText : count;

    const strokeWidth = 4; // Match ring thickness
    const baseBorderColor = '#4A5568';
    const hoverBorderColor = '#636E82'; // Lighter gray for hover
    const borderColor = isHovered ? hoverBorderColor : baseBorderColor;
    const borderRadius = '8px'; // Rounded corners

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          textAlign: 'center',
          border: `${strokeWidth}px solid ${borderColor}`,
          borderRadius: borderRadius,
          boxSizing: 'border-box', // Include border in size calculation
          transition: 'border-color 0.3s ease', // Add transition
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span
          style={{
            fontSize: size * 0.25, // Match ring percentage font size
            fontWeight: 600,
            color: '#E2E8F0',
            lineHeight: 1,
          }}
        >
          {displayValue}
        </span>
        {/* Re-add label rendering */}
        {label && (
          <span
            style={{
              fontSize: size * 0.18, // Keep label size smaller
              color: '#A0AEC0',
              lineHeight: 1,
              marginTop: size * 0.05,
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  };

  if (tooltipText) {
    return <Tooltip title={tooltipText}>{renderContent()}</Tooltip>;
  }

  return renderContent();
};

export default CountDisplay;
